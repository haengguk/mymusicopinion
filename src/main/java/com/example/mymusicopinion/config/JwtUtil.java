package com.example.mymusicopinion.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Component // 스프링 컨테이너에 빈으로 등록
public class JwtUtil {

    public static final String AUTHORIZATION_HEADER = "Authorization";

    // 서명에 사용할 키
    @Value("${jwt.secret.key}")
    private String secretKey;

    private Key key;
    private final SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;

    // 객체 초기화 : secretKey를 Base64로 디코딩하여 Key 객체 생성
    @jakarta.annotation.PostConstruct
    public void init() {
        byte[] bytes = Base64.getDecoder().decode(secretKey);
        key = Keys.hmacShaKeyFor(bytes);
    }

    // JWT 생성
    public String createJwtToken(String username) {
        Date date = new Date();
        long TOKEN_TIME = 24 * 60 * 60 * 1000L; // 24시간

        return Jwts.builder()
                .setSubject(username) // 사용자 이름
                .setExpiration(new Date(date.getTime() + TOKEN_TIME)) // 만료 시간
                .setIssuedAt(date) // 발급 시간
                .signWith(key, signatureAlgorithm) // 서명
                .compact();
    }

    // JWT 검증 및 정보 추출
    public Claims getUserInfoFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody();
    }

}
