package com.taskapp.api.config;

import java.time.Instant;
import java.util.List;

import org.springframework.security.oauth2.jwt.Jwt;

class SecurityConfigTest {

    private static final String CLIENT_ID = "google-client-id.apps.googleusercontent.com";

    private static Jwt token(String issuer, String audience, String subject) {
        Jwt.Builder builder = Jwt.withTokenValue("test-token")
                .header("alg", "RS256")
                .issuer(issuer)
                .audience(List.of(audience))
                .issuedAt(Instant.now().minusSeconds(60))
                .expiresAt(Instant.now().plusSeconds(60));
        if (subject != null) {
            builder.subject(subject);
        }
        return builder.build();
    }
}
