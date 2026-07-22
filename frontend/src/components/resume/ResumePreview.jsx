import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, Download, Loader2, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export function ResumePreview({ pdfUrl, onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  function onLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onLoadError(err) {
    setError(err.message || 'Failed to load PDF preview');
    setLoading(false);
  }

  if (!pdfUrl) return null;

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4' : ''}`}>
      <div className={`bg-bg-card rounded-2xl border border-border-color shadow-2xl overflow-hidden ${
        fullscreen ? 'w-full max-w-4xl max-h-[90vh]' : ''
      }`}>
        {fullscreen && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-color">
            <h3 className="text-sm font-semibold text-text-main">Resume Preview</h3>
            <div className="flex items-center gap-2">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Download PDF"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => setFullscreen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center p-4">
          {loading && (
            <div className="flex items-center gap-3 py-12 text-text-muted">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading preview...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 py-12 px-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm text-text-muted">{error}</p>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent-600 hover:text-accent-700 underline"
              >
                Open PDF directly instead
              </a>
            </div>
          )}

          <Document
            file={pdfUrl}
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
            loading={<div />}
          >
            {!loading && !error && (
              <>
                <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-sm" />
                {numPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <button
                      onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                      disabled={pageNumber <= 1}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-text-main hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-text-muted">
                      Page {pageNumber} of {numPages}
                    </span>
                    <button
                      onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                      disabled={pageNumber >= numPages}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-text-main hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </Document>

          {!fullscreen && !loading && (
            <div className="flex items-center gap-3 mt-4">
              {!error && (
                <button
                  onClick={() => setFullscreen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-text-main hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Maximize2 className="w-3 h-3" /> Fullscreen
                </button>
              )}
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-main transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
