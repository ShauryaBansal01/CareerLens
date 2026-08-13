# CareerLens PDF Layout Service

A small Spring Boot service that extracts text from uploaded resumes **along with the layout information the Node backend cannot see**.

## Why this exists

The Node backend uses `pdf-parse`, which returns a flat string with no geometry. That is fine for text, but it means a **two-column resume is indistinguishable from a single-column one** — and multi-column layouts are exactly what real applicant tracking systems scramble, reading straight across the gutter and interleaving unrelated lines.

CareerLens already warned about this, but only for LaTeX source:

```js
// backend/services/atsService.js
{ pattern: /\\begin\{multicols\}/g, severity: 'high', ... }
```

That regex can never match an uploaded PDF. So for the most common case — a resume exported from Word or Canva — the product could not detect the very problem it exists to catch.

Apache PDFBox exposes per-glyph coordinates. With X positions you can see the gutter, which is what makes the detection possible.

## What it returns

```
POST /extract    multipart/form-data, field name "file"
GET  /health
```

```json
{
  "text": "Engineered REST APIs in Node.js...",
  "pageCount": 1,
  "columnCount": 2,
  "hasImages": false,
  "imageCount": 0,
  "charCount": 1584,
  "warnings": [
    "Multi-column layout detected — many ATS parsers read straight across columns, interleaving unrelated lines."
  ]
}
```

## How column detection works

`LayoutAnalyzer` extends `PDFTextStripper` and records the X span of every glyph. It then:

1. Builds a 100-bin horizontal coverage histogram across the page width.
2. Looks for the longest near-empty run of bins between 20% and 80% of the width — a candidate gutter. "Near-empty" is relative to the busiest bin, so a stray rule or page number does not disqualify an otherwise clear gutter.
3. Requires the gutter to be at least 6 bins (~6% of page width), which rules out ordinary word spacing.
4. Requires **both** sides to carry at least 15% of the page's glyphs, so a centred heading with wide margins is not mistaken for two columns.

Pages are analysed individually and the document takes the maximum — the scrambling risk is per-page.

## Table detection

Ruled tables — those drawn with visible borders — are found by extending
`PDFGraphicsStreamEngine` and capturing the page's line-drawing operations.
Axis-aligned segments longer than 40pt are collected, and a table is reported
only when at least 3 horizontal and 2 vertical rules **actually intersect**.

That intersection requirement is what stops underlined section headings — four
parallel horizontal rules, nothing crossing them — being reported as a table.
There is a test for exactly that false positive.

Borderless tables are deliberately **not** detected. Identifying them means
inferring structure from column alignment alone, which mistakes an ordinary
two-column skills list for a table often enough that the warning would cost the
user more than it gains.

## Running it

Requires **JDK 17+** (built against 21). Maven is not needed — the wrapper is
committed.

```bash
./mvnw test        # 14 tests; builds real PDFs in memory and asserts detection
./mvnw package     # produces target/pdf-service-1.0.0.jar
java -jar target/pdf-service-1.0.0.jar
```

Or with Docker:

```bash
docker build -t careerlens-pdf-service .
docker run -p 8080:8080 -e PDF_SERVICE_TOKEN=your-secret careerlens-pdf-service
```

Then point the Node backend at it:

```
PDF_SERVICE_URL=http://localhost:8080
PDF_SERVICE_TOKEN=your-secret
```

## Authentication

`POST /extract` requires an `X-Service-Token` header matching the service's
`PDF_SERVICE_TOKEN`. Compared in constant time.

This is not a public API — the Node backend is its only legitimate caller. Left
open it is both a free PDF-parsing service for anyone who finds the URL and an
easy CPU-exhaustion target, since PDFBox parsing costs far more than issuing a
request.

`GET /health` stays open so platform probes work. When `PDF_SERVICE_TOKEN` is
unset the filter allows everything, so local development needs no setup —
**production must set it**.

Concurrent parses are capped at the CPU count, with requests queueing up to 20
seconds before the service returns `503` with `Retry-After`. The Node client
treats that like any other failure and falls back.

## Deploying to Render

New Web Service → Docker → root directory `pdf-service`. Set `PDF_SERVICE_TOKEN`
in its environment, and on the **backend** service set `PDF_SERVICE_URL` plus the
same token.

One caveat: Render's free tier spins down when idle, and a cold JVM start takes
10–20 seconds. The Node client's 15-second timeout will trip on the first
request after a quiet period and fall back to `pdf-parse` — losing the layout
warnings, not the upload. Raise `PDF_SERVICE_TIMEOUT_MS` or use a paid instance
if that matters.

## It is optional by design

`backend/services/pdfExtractionService.js` calls this service only when `PDF_SERVICE_URL` is set, with a 15-second timeout, and falls back to `pdf-parse` on any failure. If the service is unset, down, or slow, uploads keep working exactly as before — the user loses the layout warnings, never the feature. This mirrors the fallback pattern used elsewhere in the codebase (AI scoring → deterministic scoring).
