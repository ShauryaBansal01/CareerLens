package com.careerlens.pdf;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.graphics.PDXObject;
import org.apache.pdfbox.pdmodel.graphics.form.PDFormXObject;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

@Service
public class ExtractionService {

    /**
     * Parsing is CPU-bound and far more expensive than issuing the request, so
     * unbounded concurrency lets a modest number of large PDFs saturate the
     * instance. Queue beyond this rather than parsing everything at once.
     */
    private static final int MAX_CONCURRENT_PARSES =
            Math.max(2, Runtime.getRuntime().availableProcessors());

    /** How long a request waits for a parsing slot before giving up. */
    private static final long QUEUE_TIMEOUT_SECONDS = 20;

    private final Semaphore parseSlots = new Semaphore(MAX_CONCURRENT_PARSES);

    /** Resumes longer than this are unusual and worth flagging to the user. */
    private static final int RECOMMENDED_MAX_PAGES = 2;

    /** Below this, extraction probably failed — a scanned image, most likely. */
    private static final int MIN_EXPECTED_CHARS = 200;

    public ExtractionResult extract(byte[] pdfBytes) throws IOException, BusyException {
        boolean acquired;
        try {
            acquired = parseSlots.tryAcquire(QUEUE_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusyException("Interrupted while waiting to parse");
        }
        if (!acquired) {
            throw new BusyException("Server is busy parsing other documents");
        }

        try {
            return doExtract(pdfBytes);
        } finally {
            parseSlots.release();
        }
    }

    /** Thrown when the service is at capacity; the caller should retry or fall back. */
    public static class BusyException extends Exception {
        public BusyException(String message) {
            super(message);
        }
    }

    private ExtractionResult doExtract(byte[] pdfBytes) throws IOException {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            int pageCount = document.getNumberOfPages();

            // A resume is multi-column if any page is; the scrambling risk is
            // per-page, not per-document.
            int columnCount = 1;
            for (int page = 1; page <= pageCount; page++) {
                columnCount = Math.max(columnCount, LayoutAnalyzer.columnsForPage(document, page));
            }

            boolean hasTables = false;
            for (PDPage page : document.getPages()) {
                if (TableDetector.pageHasTable(page)) {
                    hasTables = true;
                    break;
                }
            }

            int imageCount = countImages(document);
            int charCount = text.replaceAll("\\s", "").length();

            List<String> warnings = new ArrayList<>();

            if (hasTables) {
                warnings.add("Table layout detected — ATS parsers often read table cells "
                        + "out of order or merge them together.");
            }
            if (columnCount > 1) {
                warnings.add("Multi-column layout detected — many ATS parsers read straight "
                        + "across columns, interleaving unrelated lines.");
            }
            if (imageCount > 0) {
                warnings.add("Embedded image detected (" + imageCount + ") — ATS parsers "
                        + "cannot read text inside images.");
            }
            if (charCount < MIN_EXPECTED_CHARS) {
                warnings.add("Very little selectable text found — this may be a scanned "
                        + "document, which most ATS parsers cannot read at all.");
            }
            if (pageCount > RECOMMENDED_MAX_PAGES) {
                warnings.add("Resume is " + pageCount + " pages — most reviewers expect "
                        + RECOMMENDED_MAX_PAGES + " or fewer.");
            }

            return new ExtractionResult(
                    text, pageCount, columnCount, imageCount > 0, imageCount, hasTables, charCount, warnings);
        }
    }

    /**
     * Counts raster images across the document. Form XObjects are walked one
     * level deep because images are frequently nested inside them rather than
     * sitting directly on the page.
     */
    private int countImages(PDDocument document) throws IOException {
        int count = 0;
        for (PDPage page : document.getPages()) {
            count += countImages(page.getResources(), 0);
        }
        return count;
    }

    private int countImages(PDResources resources, int depth) throws IOException {
        if (resources == null || depth > 1) {
            return 0;
        }
        int count = 0;
        for (var name : resources.getXObjectNames()) {
            PDXObject xObject = resources.getXObject(name);
            if (xObject instanceof PDImageXObject) {
                count++;
            } else if (xObject instanceof PDFormXObject form) {
                count += countImages(form.getResources(), depth + 1);
            }
        }
        return count;
    }
}
