package com.example.mymusicopinion.exceptions;

import lombok.Getter;

// 일종의 dto 역할을 하는 클래스

@Getter
public class ErrorResponse {
    private final String code;
    private final String message;

    public ErrorResponse(String code, String message) {
        this.code = code;
        this.message = message;
    }
}
