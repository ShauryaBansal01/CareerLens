package com.careerlens.pdf;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class ServiceTokenFilterTest {

    private MockHttpServletRequest request(String uri, String token) {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", uri);
        req.setRequestURI(uri);
        if (token != null) {
            req.addHeader(ServiceTokenFilter.HEADER, token);
        }
        return req;
    }

    @Test
    void rejectsARequestWithNoToken() throws Exception {
        ServiceTokenFilter filter = new ServiceTokenFilter("s3cret");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request("/extract", null), response, chain);

        assertEquals(401, response.getStatus());
        verify(chain, never()).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void rejectsAWrongToken() throws Exception {
        ServiceTokenFilter filter = new ServiceTokenFilter("s3cret");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request("/extract", "wrong"), response, chain);

        assertEquals(401, response.getStatus());
        verify(chain, never()).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void acceptsTheCorrectToken() throws Exception {
        ServiceTokenFilter filter = new ServiceTokenFilter("s3cret");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request("/extract", "s3cret"), response, chain);

        assertEquals(200, response.getStatus());
        verify(chain, times(1)).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void leavesHealthOpenSoPlatformProbesWork() throws Exception {
        // Render and uptime checks cannot present the token.
        ServiceTokenFilter filter = new ServiceTokenFilter("s3cret");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request("/health", null), response, chain);

        assertEquals(200, response.getStatus());
        verify(chain, times(1)).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void allowsEverythingWhenNoTokenIsConfigured() throws Exception {
        // Local development needs no setup; production must set the variable.
        ServiceTokenFilter filter = new ServiceTokenFilter("");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request("/extract", null), response, chain);

        assertEquals(200, response.getStatus());
        verify(chain, times(1)).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }
}
