const pdfParse = require('pdf-parse');

/**
 * Text extraction with an optional layout-aware backend.
 *
 * `pdf-parse` returns a flat string with no geometry, so a two-column resume —
 * the layout most likely to be scrambled by a real ATS — is indistinguishable
 * from a single-column one. The Java service (pdf-service/) uses PDFBox, which
 * exposes per-glyph coordinates, and reports column count, embedded images and
 * page count alongside the text.
 *
 * It is strictly optional. With PDF_SERVICE_URL unset, or the service down, or
 * slow, this falls back to pdf-parse and the upload succeeds exactly as before
 * — the user loses the layout warnings, never the feature.
 */

const TIMEOUT_MS = Number(process.env.PDF_SERVICE_TIMEOUT_MS) || 15000;

async function extractViaService(buffer) {
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: 'application/pdf' }), 'resume.pdf');

  const headers = {};
  if (process.env.PDF_SERVICE_TOKEN) {
    headers['X-Service-Token'] = process.env.PDF_SERVICE_TOKEN;
  }

  const response = await fetch(`${process.env.PDF_SERVICE_URL.replace(/\/$/, '')}/extract`, {
    method: 'POST',
    body: form,
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`pdf-service responded ${response.status}`);
  }

  const data = await response.json();
  if (typeof data.text !== 'string') {
    throw new Error('pdf-service returned no text');
  }

  return {
    text: data.text,
    pageCount: data.pageCount ?? null,
    columnCount: data.columnCount ?? null,
    hasImages: data.hasImages ?? false,
    imageCount: data.imageCount ?? 0,
    hasTables: data.hasTables ?? false,
    layoutWarnings: Array.isArray(data.warnings) ? data.warnings : [],
    source: 'pdf-service',
  };
}

async function extractPdf(buffer) {
  if (process.env.PDF_SERVICE_URL) {
    try {
      return await extractViaService(buffer);
    } catch (error) {
      // Degrade quietly. A layout service being unreachable must never turn a
      // working upload into a failed one.
      console.warn('pdf-service unavailable, falling back to pdf-parse:', error.message);
    }
  }

  let data;
  try {
    data = await pdfParse(buffer);
  } catch (error) {
    // pdf-parse rides on a very old pdf.js and rejects structures PDFBox reads
    // without complaint — a PDF 1.6 file produced by PDFBox fails here with
    // "Invalid PDF structure". Surface something the user can act on instead of
    // letting a parser internal reach the error handler.
    const wrapped = new Error(
      'Could not read this PDF. It may use a newer format than the parser supports — try re-exporting or saving it as a different PDF version.'
    );
    wrapped.code = 'PDF_PARSE_FAILED';
    wrapped.cause = error;
    throw wrapped;
  }

  return {
    text: data.text,
    pageCount: data.numpages ?? null,
    columnCount: null,      // unknowable without glyph positions
    hasImages: false,
    imageCount: 0,
    hasTables: false,
    layoutWarnings: [],
    source: 'pdf-parse',
  };
}

module.exports = { extractPdf };
