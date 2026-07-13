package com.manas.portfolio.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory per-IP rate limiter: allows a small number of contact
 * submissions per IP per rolling window. This is enough to stop casual
 * spam/bot abuse on a single-instance deployment. It resets if the app
 * restarts, and does not share state across multiple instances - if you
 * later scale the backend horizontally, swap this for Redis or similar.
 */
@Service
public class RateLimiterService {

    private static final int MAX_REQUESTS = 5;
    private static final long WINDOW_MILLIS = 15 * 60 * 1000L; // 15 minutes

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    public boolean isAllowed(String clientIp) {
        long now = Instant.now().toEpochMilli();
        Window window = windows.compute(clientIp, (ip, existing) -> {
            if (existing == null || now - existing.windowStart > WINDOW_MILLIS) {
                return new Window(now);
            }
            return existing;
        });

        return window.count.incrementAndGet() <= MAX_REQUESTS;
    }

    private static class Window {
        final long windowStart;
        final AtomicInteger count = new AtomicInteger(0);

        Window(long windowStart) {
            this.windowStart = windowStart;
        }
    }
}
