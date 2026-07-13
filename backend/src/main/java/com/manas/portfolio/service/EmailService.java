package com.manas.portfolio.service;

import com.manas.portfolio.dto.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${contact.to-email}")
    private String ownerEmail;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends the visitor's message straight to the portfolio owner's inbox.
     * Reply-To is set to the visitor's email so you can hit "reply" directly.
     * Throws MailException if delivery fails - the caller decides how to respond to the client.
     */
    public void sendOwnerNotification(ContactRequest request) throws MailException {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, StandardCharsets.UTF_8.name());

            helper.setTo(ownerEmail);
            helper.setFrom(fromEmail);
            helper.setReplyTo(request.getEmail());
            helper.setSubject("Portfolio Contact: " + request.getSubject());
            helper.setText(buildOwnerEmailBody(request));

            mailSender.send(mimeMessage);
        } catch (Exception e) {
            log.error("Failed to send owner notification email", e);
            throw new org.springframework.mail.MailSendException("Could not send notification email", e);
        }
    }

    /**
     * Sends a short "we got your message" confirmation back to the visitor.
     * Failures here are logged but never block the main flow - the owner
     * notification above is the important delivery.
     */
    public void sendVisitorAcknowledgment(ContactRequest request) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, StandardCharsets.UTF_8.name());

            helper.setTo(request.getEmail());
            helper.setFrom(fromEmail);
            helper.setSubject("Thanks for reaching out, " + request.getName() + "!");
            helper.setText(buildVisitorEmailBody(request));

            mailSender.send(mimeMessage);
        } catch (Exception e) {
            log.warn("Could not send visitor acknowledgment email (non-fatal): {}", e.getMessage());
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
