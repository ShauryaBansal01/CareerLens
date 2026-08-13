package com.careerlens.pdf;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Rejects callers that do not present the shared service token.
 *
 * <p>This service is not a public API — the Node backend is its only legitimate
 * caller. Left open, it is both a free PDF-parsing service for anyone who finds
 * the URL and an easy CPU-exhaustion target, since PDFBox parsing is expensive
 * relative to the cost of sending a request.
 *
 * <p>When {@code PDF_SERVICE_TOKEN} is unset the filter allows everything, so
 * local development needs no configuration. Production must set it.
 */
@Component
public class ServiceTokenFilter extends OncePerRequestFilter {

    static final String HEADER = "X-Service-Token";

    private final String expectedToken;

    public ServiceTokenFilter(@Value("${PDF_SERVICE_TOKEN:}") String expectedToken) {
        this.expectedToken = expectedToken == null ? "" : expectedToken.trim();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        if (expectedToken.isEmpty() || "/health".equals(request.getRequestURI())) {
            chain.doFilter(request, response);
            return;
        }

        String presented = request.getHeader(HEADER);
        if (presented == null || !constantTimeEquals(expectedToken, presented)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Unauthorized\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    /** Length-independent comparison, so timing cannot reveal the token. */
    private boolean constantTimeEquals(String a, String b) {
        return MessageDigest.isEqual(
                a.getBytes(StandardCharsets.UTF_8),
                b.getBytes(StandardCharsets.UTF_8));
    }
}
