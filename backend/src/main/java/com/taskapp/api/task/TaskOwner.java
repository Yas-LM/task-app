package com.taskapp.api.task;

import org.springframework.security.oauth2.jwt.Jwt;

public final class TaskOwner {

    private TaskOwner() {
    }

    public static String from(Jwt jwt) {
        return "google:" + jwt.getSubject();
    }
}
