package com.manas.portfolio.service;

import com.manas.portfolio.dto.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Sends contact form emails via Resend's HTTP API (https://resend.com)
 * instead of raw SMTP. Most free-tier hosts (Render included) block
 * outbound SMTP ports (25/465/587) to prevent spam, which makes direct
 * Gmail SMTP time out. An HTTPS API call on port 443 is never blocked.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${resend.api-key}")
    private String resendApiKey;

    @Value("${resend.from-email}")
    private String fromEmail;

    @Value("${contact.to-email}")
    private String ownerEmail;

    /**
     * Sends the visitor's message straight to the portfolio owner's inbox.
     * Reply-To is set to the visitor's email so you can hit "reply" directly.
     * Throws RestClientException if delivery fails - the caller decides how to respond to the client.
     */
    public void sendOwnerNotification(ContactRequest request) {
        Map<String, Object> payload = Map.of(
                "from", fromEmail,
                "to", List.of(ownerEmail),
                "reply_to", request.getEmail(),
                "subject", "Portfolio Contact: " + request.getSubject(),
                "text", buildOwnerEmailBody(request)
        );

        try {
            send(payload);
        } catch (RestClientException e) {
            log.error("Failed to send owner notification email", e);
            throw e;
        }
    }

    /**
     * Sends a short "we got your message" confirmation back to the visitor.
     * Failures here are logged but never block the main flow - the owner
     * notification above is the important delivery.
     */
    public void sendVisitorAcknowledgment(ContactRequest request) {
        Map<String, Object> payload = Map.of(
                "from", fromEmail,
                "to", List.of(request.getEmail()),
                "subject", "Thanks for reaching out, " + request.getName() + "!",
                "text", buildVisitorEmailBody(request)
        );

        try {
            send(payload);
        } catch (RestClientException e) {
            log.warn("Could not send visitor acknowledgment email (non-fatal): {}", e.getMessage());
        }
    }

    private void send(Map<String, Object> payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(resendApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        var response = restTemplate.postForEntity(RESEND_API_URL, entity, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RestClientException("Resend API returned status " + response.getStatusCode());
        }
    }

    private String buildOwnerEmailBody(ContactRequest request) {
        return "New message from your portfolio contact form:\n\n" +
                "Name: " + request.getName() + "\n" +
                "Email: " + request.getEmail() + "\n" +
                "Subject: " + request.getSubject() + "\n\n" +
                "Message:\n" + request.getMessage() + "\n\n" +
                "---\n" +
                "Reply directly to this email to respond to " + request.getName() + ".";
    }

    private String buildVisitorEmailBody(ContactRequest request) {
        return "Hi " + request.getName() + ",\n\n" +
                "Thanks for reaching out through my portfolio! I've received your message and will get back to you as soon as I can.\n\n" +
                "Here's a copy of what you sent:\n\n" +
                "Subject: " + request.getSubject() + "\n" +
                request.getMessage() + "\n\n" +
                "Best,\nManas Suryavanshi";
    }
}
