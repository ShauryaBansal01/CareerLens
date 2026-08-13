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

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TableDetectorTest {

    private final ExtractionService service = new ExtractionService();

    /** A resume with a real bordered grid, as Word exports one. */
    private byte[] tabularPdf() throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                cs.beginText();
                cs.newLineAtOffset(60, 730);
                cs.showText("Skills matrix");
                cs.endText();

                cs.setLineWidth(0.7f);
                // 4 horizontal rules
                for (int row = 0; row < 4; row++) {
                    float y = 700 - row * 30;
                    cs.moveTo(60, y);
                    cs.lineTo(460, y);
                    cs.stroke();
                }
                // 3 vertical rules crossing them
                for (int col = 0; col < 3; col++) {
                    float x = 60 + col * 200;
                    cs.moveTo(x, 700);
                    cs.lineTo(x, 610);
                    cs.stroke();
                }
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        }
    }

    /** Underlined section headings — parallel rules, but no grid. */
    private byte[] underlinedHeadingsPdf() throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                String[] headings = {"Experience", "Education", "Skills", "Projects"};
                float y = 720;
                for (String heading : headings) {
                    cs.beginText();
                    cs.newLineAtOffset(60, y);
                    cs.showText(heading);
                    cs.endText();
                    cs.moveTo(60, y - 4);
                    cs.lineTo(460, y - 4);
                    cs.stroke();
                    y -= 60;
                }
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        }
    }

    @Test
    void detectsARuledTable() throws Exception {
        ExtractionResult result = service.extract(tabularPdf());
        assertTrue(result.hasTables(), "a bordered grid should be detected as a table");
        assertTrue(result.warnings().stream().anyMatch(w -> w.contains("Table layout")),
                "a table should raise a warning");
    }

    @Test
    void doesNotMistakeUnderlinedHeadingsForATable() throws Exception {
        // Four horizontal rules, but nothing crossing them. Requiring
        // intersection is what keeps this from being a false positive.
        ExtractionResult result = service.extract(underlinedHeadingsPdf());
        assertFalse(result.hasTables(), "underlined headings are not a table");
    }

    @Test
    void reportsNoTableForPlainText() throws Exception {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                cs.beginText();
                cs.newLineAtOffset(60, 700);
                cs.showText("Engineered REST APIs in Node.js and Express");
                cs.endText();
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            ExtractionResult result = service.extract(out.toByteArray());
            assertFalse(result.hasTables());
        }
    }
}
