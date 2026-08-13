package com.careerlens.pdf;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Builds real PDFs in memory rather than checking in fixtures, so the layout
 * detector is exercised against actual glyph geometry.
 */
class ExtractionServiceTest {

    private final ExtractionService service = new ExtractionService();

    private static final String[] LINES = {
            "Engineered REST APIs in Node.js and Express",
            "Optimized PostgreSQL indexing and caching",
            "Deployed microservices with Docker on AWS",
            "Instrumented monitoring and observability",
            "Migrated event processing to Kafka queues",
            "Led code reviews and mentored new joiners",
            "Reduced p95 latency by sixty percent",
            "Automated the release pipeline end to end",
    };

    private byte[] singleColumnPdf() throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                cs.beginText();
                cs.newLineAtOffset(60, 720);
                for (int repeat = 0; repeat < 4; repeat++) {
                    for (String line : LINES) {
                        cs.showText(line);
                        cs.newLineAtOffset(0, -16);
                    }
                }
                cs.endText();
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        }
    }

    private byte[] twoColumnPdf() throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                // Left column, then right column, with a clear gutter between.
                for (float x : new float[]{50, 330}) {
                    cs.beginText();
                    cs.newLineAtOffset(x, 720);
                    for (int repeat = 0; repeat < 4; repeat++) {
                        for (String line : LINES) {
                            cs.showText(line.substring(0, Math.min(28, line.length())));
                            cs.newLineAtOffset(0, -16);
                        }
                    }
                    cs.endText();
                }
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        }
    }

    @Test
    void extractsTextFromASingleColumnResume() throws Exception {
        ExtractionResult result = service.extract(singleColumnPdf());
        assertTrue(result.text().contains("Express"), "expected extracted text to contain resume content");
        assertEquals(1, result.pageCount());
        assertTrue(result.charCount() > 200);
    }

    @Test
    void reportsOneColumnForALinearResume() throws Exception {
        ExtractionResult result = service.extract(singleColumnPdf());
        assertEquals(1, result.columnCount());
        assertTrue(result.warnings().stream().noneMatch(w -> w.contains("Multi-column")),
                "single-column resume should not raise a multi-column warning");
    }

    @Test
    void detectsATwoColumnResume() throws Exception {
        // This is the case pdf-parse cannot see: the text extracts fine, but
        // reading order is scrambled by an ATS.
        ExtractionResult result = service.extract(twoColumnPdf());
        assertEquals(2, result.columnCount());
        assertTrue(result.warnings().stream().anyMatch(w -> w.contains("Multi-column")),
                "two-column resume should raise a multi-column warning");
    }

    @Test
    void reportsNoImagesWhenThereAreNone() throws Exception {
        ExtractionResult result = service.extract(singleColumnPdf());
        assertFalse(result.hasImages());
        assertEquals(0, result.imageCount());
    }

    @Test
    void warnsWhenAlmostNoTextIsSelectable() throws Exception {
        try (PDDocument doc = new PDDocument()) {
            doc.addPage(new PDPage(PDRectangle.LETTER));
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            ExtractionResult result = service.extract(out.toByteArray());
            assertTrue(result.warnings().stream().anyMatch(w -> w.contains("scanned")),
                    "an empty page should be flagged as possibly scanned");
        }
    }

    @Test
    void warnsWhenTheResumeRunsLong() throws Exception {
        try (PDDocument doc = new PDDocument()) {
            for (int i = 0; i < 3; i++) {
                PDPage page = new PDPage(PDRectangle.LETTER);
                doc.addPage(page);
                try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                    cs.beginText();
                    cs.newLineAtOffset(60, 720);
                    for (String line : LINES) {
                        cs.showText(line);
                        cs.newLineAtOffset(0, -16);
                    }
                    cs.endText();
                }
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            ExtractionResult result = service.extract(out.toByteArray());
            assertEquals(3, result.pageCount());
            assertTrue(result.warnings().stream().anyMatch(w -> w.contains("pages")));
        }
    }
}
