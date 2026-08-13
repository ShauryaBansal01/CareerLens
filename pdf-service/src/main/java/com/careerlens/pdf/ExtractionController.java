package com.careerlens.pdf;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
public class ExtractionController {

    private static final Logger log = LoggerFactory.getLogger(ExtractionController.class);

    /** The five bytes every PDF starts with. */
    private static final byte[] PDF_MAGIC = {'%', 'P', 'D', 'F', '-'};

    private final ExtractionService extractionService;

    public ExtractionController(ExtractionService extractionService) {
        this.extractionService = extractionService;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "ok", "service", "pdf-service");
    }

    @PostMapping("/extract")
    public ResponseEntity<?> extract(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No file uploaded"));
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            log.warn("Could not read uploaded file: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", "Could not read the uploaded file"));
        }

        // Checked here as well as in Node. This service is independently
        // addressable, so it cannot assume its caller validated anything.
        if (!hasPdfMagic(bytes)) {
            return ResponseEntity.badRequest().body(Map.of("message", "That file is not a valid PDF."));
        }

        try {
            return ResponseEntity.ok(extractionService.extract(bytes));
        } catch (ExtractionService.BusyException e) {
            // 503 with Retry-After, so the caller can distinguish "try again"
            // from "this PDF is broken" and fall back cleanly.
            log.warn("Rejected upload, at capacity: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .header("Retry-After", "5")
                    .body(Map.of("message", "Service is busy — please retry shortly."));
        } catch (IOException e) {
            log.warn("PDF extraction failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(Map.of("message", "Could not parse this PDF — it may be corrupt or encrypted."));
        }
    }

    private boolean hasPdfMagic(byte[] bytes) {
        if (bytes.length < PDF_MAGIC.length) {
            return false;
        }
        for (int i = 0; i < PDF_MAGIC.length; i++) {
            if (bytes[i] != PDF_MAGIC[i]) {
                return false;
            }
        }
        return true;
    }
}
