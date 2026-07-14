package com.manas.portfolio.controller;

import com.manas.portfolio.dto.ApiResponse;
import com.manas.portfolio.dto.ContactRequest;
import com.manas.portfolio.service.EmailService;
import com.manas.portfolio.service.RateLimiterService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);

    private final EmailService emailService;
    private final RateLimiterService rateLimiterService;

    public ContactController(EmailService emailService, RateLimiterService rateLimiterService) {
        this.emailService = emailService;
        this.rateLimiterService = rateLimiterService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    @PostMapping("/contact")
    public ResponseEntity<ApiResponse> submitContact(@Valid @RequestBody ContactRequest request,
                                                       HttpServletRequest httpRequest) {

        // Honeypot check: bots fill every field, real users never see/fill this one.
        if (request.getWebsite() != null && !request.getWebsite().isBlank()) {
            log.info("Honeypot triggered, silently discarding submission");
            return ResponseEntity.ok(ApiResponse.ok("Thank you! Your message has been sent."));
        }

        String clientIp = resolveClientIp(httpRequest);
        if (!rateLimiterService.isAllowed(clientIp)) {
            log.warn("Rate limit exceeded for IP {}", clientIp);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(ApiResponse.error("Too many messages sent recently. Please try again later."));
        }

        try {
            emailService.sendOwnerNotification(request);
        } catch (Exception e) {
            log.error("Failed to deliver contact form email", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Sorry, your message could not be sent right now. Please email me directly instead."));
        }

        // Best-effort confirmation email to the visitor; failures here don't fail the request.
        emailService.sendVisitorAcknowledgment(request);

        return ResponseEntity.ok(ApiResponse.ok("Thank you! Your message has been sent."));
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
