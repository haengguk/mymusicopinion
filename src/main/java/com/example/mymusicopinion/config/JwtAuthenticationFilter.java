package com.example.mymusicopinion.config;

import com.example.mymusicopinion.models.User;
import com.example.mymusicopinion.repositories.UserRepository;
import com.example.mymusicopinion.security.UserDetailsImpl;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// Slf4j 어노테이션을 통해 로깅 기능을 쉽게 사용할 수 있게 함. topic을 지정하여 로그 출력 시 식별자로 사용.
@Slf4j(topic = "JWT 검증 및 인가")
// OncePerRequestFilter: 모든 서블릿 요청에 대해 단 한 번만 실행되는 필터를 만들기 위한 클래스.
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil; // JWT 관련 유틸리티 클래스 (토큰 생성, 검증 등)
    private final UserRepository userRepository; // 사용자 정보를 DB에서 조회하기 위한 리포지토리

    // 생성자를 통해 JwtUtil과 UserRepository를 주입받음
    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    // 필터의 실제 동작을 정의하는 메서드. HTTP 요청이 들어올 때마다 실행됨.
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // HTTP 요청 헤더에서 'Authorization' 값을 가져옴. 여기에 JWT가 담겨 있음.
        String token = request.getHeader("Authorization");

        // 토큰이 null이 아닌 경우, 즉 헤더에 토큰이 포함된 경우에만 검증 로직을 실행.
        if (token != null) {
            try {
                // jwtUtil을 사용하여 토큰을 검증하고, 토큰에 담긴 사용자 정보를 Claims 객체로 받아옴.
                // 만약 토큰이 유효하지 않다면(만료, 위조 등), 여기서 예외가 발생함.
                Claims userInfo = jwtUtil.getUserInfoFromToken(token);
                String username = userInfo.getSubject(); // Claims에서 사용자 이름(subject)을 추출.

                // 토큰에서 추출한 사용자 이름을 기반으로 DB에서 실제 사용자 정보를 조회.
                User user = userRepository.findByUsername(username).orElseThrow(
                        () -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")
                );

                UserDetails userDetails = new UserDetailsImpl(user);

                // 인증(Authentication) 객체를 생성. 이 객체는 사용자가 성공적으로 인증되었음을 증명.
                Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, null);

                // SecurityContextHolder: Spring Security의 핵심. 현재 실행 중인 스레드의 보안 컨텍스트를 관리.
                // createEmptyContext(): 비어있는 새로운 SecurityContext를 생성.
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                // 생성된 컨텍스트에 위에서 만든 인증 객체를 설정.
                context.setAuthentication(authentication);
                // SecurityContextHolder에 완성된 컨텍스트를 최종적으로 설정.
                // 이제부터 이 요청을 처리하는 동안, Spring Security는 이 사용자가 인증된 것으로 간주함.
                SecurityContextHolder.setContext(context);

            } catch (Exception e) {
                // 토큰 검증 과정에서 예외가 발생한 경우 로그를 남김.
                log.error("Token Error: " + e.getMessage());
            }
        }

        // 현재 필터의 작업이 끝났으므로, 다음 필터로 요청(request)과 응답(response)을 전달.
        // 이 코드가 없으면 요청이 컨트롤러까지 도달하지 못하고 여기서 멈춤.
        filterChain.doFilter(request, response);
    }
}