package com.careerlens.pdf;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Extracts text while recording where on the page each glyph sat.
 *
 * <p>This is the reason the service exists. {@code pdf-parse} on the Node side
 * returns a single flat string with no geometry, so a two-column resume — the
 * layout most likely to be scrambled by a real applicant tracking system —
 * is indistinguishable from a single-column one. PDFBox hands us the X range of
 * every glyph, and a column gutter is visible in that distribution.
 */
public class LayoutAnalyzer extends PDFTextStripper {

    /** Horizontal slices used to build the coverage histogram. */
    private static final int BINS = 100;

    /** Below this many glyphs the page is too sparse to judge; assume one column. */
    private static final int MIN_GLYPHS = 120;

    /** A gutter must sit within the middle of the page, not at either margin. */
    private static final double SEARCH_FROM = 0.20;
    private static final double SEARCH_TO = 0.80;

    /** A gutter narrower than this is just word spacing. 6% of page width. */
    private static final int MIN_GUTTER_BINS = 6;

    /**
     * Each side of a real gutter must carry at least this share of the page's
     * glyphs. Stops a centred heading with wide margins reading as two columns.
     */
    private static final double MIN_SIDE_SHARE = 0.15;

    private final List<float[]> spans = new ArrayList<>();
    private float pageWidth = 0f;

    public LayoutAnalyzer() throws IOException {
        super();
    }

    @Override
    protected void writeString(String text, List<TextPosition> positions) throws IOException {
        for (TextPosition p : positions) {
            float start = p.getXDirAdj();
            float end = start + p.getWidthDirAdj();
            spans.add(new float[]{start, end});
            if (end > pageWidth) {
                pageWidth = end;
            }
        }
        super.writeString(text, positions);
    }

    /**
     * @return the number of text columns detected, 1 when the page reads
     *         linearly or there is too little text to tell.
     */
    public int detectColumnCount() {
        if (spans.size() < MIN_GLYPHS || pageWidth <= 0f) {
            return 1;
        }

        int[] coverage = new int[BINS];
        for (float[] span : spans) {
            int from = bin(span[0]);
            int to = bin(span[1]);
            for (int i = from; i <= to; i++) {
                coverage[i]++;
            }
        }

        int total = 0;
        for (int c : coverage) {
            total += c;
        }
        if (total == 0) {
            return 1;
        }

        // "Empty" is relative: faint noise (a stray rule, a page number) should
        // not disqualify an otherwise clear gutter.
        int peak = 0;
        for (int c : coverage) {
            peak = Math.max(peak, c);
        }
        int emptyThreshold = Math.max(1, peak / 50);

        int searchFrom = (int) (BINS * SEARCH_FROM);
        int searchTo = (int) (BINS * SEARCH_TO);

        int bestStart = -1;
        int bestLength = 0;
        int runStart = -1;

        for (int i = searchFrom; i < searchTo; i++) {
            if (coverage[i] <= emptyThreshold) {
                if (runStart < 0) {
                    runStart = i;
                }
                int length = i - runStart + 1;
                if (length > bestLength) {
                    bestLength = length;
                    bestStart = runStart;
                }
            } else {
                runStart = -1;
            }
        }

        if (bestLength < MIN_GUTTER_BINS) {
            return 1;
        }

        // Both sides must carry real text, otherwise this is a margin, not a gutter.
        int left = 0;
        for (int i = 0; i < bestStart; i++) {
            left += coverage[i];
        }
        int right = 0;
        for (int i = bestStart + bestLength; i < BINS; i++) {
            right += coverage[i];
        }

        double leftShare = (double) left / total;
        double rightShare = (double) right / total;

        return (leftShare >= MIN_SIDE_SHARE && rightShare >= MIN_SIDE_SHARE) ? 2 : 1;
    }

    private int bin(float x) {
        int b = (int) (x / pageWidth * BINS);
        return Math.max(0, Math.min(BINS - 1, b));
    }

    /** Runs the stripper over one page and reports its column count. */
    public static int columnsForPage(PDDocument document, int pageNumber) throws IOException {
        LayoutAnalyzer analyzer = new LayoutAnalyzer();
        analyzer.setStartPage(pageNumber);
        analyzer.setEndPage(pageNumber);
        analyzer.getText(document);
        return analyzer.detectColumnCount();
    }
}
