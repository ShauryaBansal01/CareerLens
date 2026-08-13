package com.careerlens.pdf;

import java.util.List;

/**
 * What the Node backend receives back.
 *
 * <p>{@code text} is the part pdf-parse already provided. Everything else is
 * layout information that a flat text extractor cannot produce, and which the
 * ATS scorer previously had no way to check on an uploaded PDF.
 */
public record ExtractionResult(
        String text,
        int pageCount,
        int columnCount,
        boolean hasImages,
        int imageCount,
        boolean hasTables,
        int charCount,
        List<String> warnings
) {
}
