package com.example.mymusicopinion.config;

import com.example.mymusicopinion.repositories.UserRepository;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public SecurityConfig(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // CORS 설정 추가
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        // CSRF 비활성화
        http.csrf(csrf -> csrf.disable());

        // 세션 미사용 (Stateless)
        http.sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // API 접근 권한 설정
        http.authorizeHttpRequests(authz -> authz
                // 정적 리소스 허용
                .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()

                // 로그인 & 회원가입 API 허용
                .requestMatchers("/api/auth/**").permitAll()

                // 조회용 API 허용 (GET) - 게시글 목록, 노래 목록 등
                .requestMatchers(HttpMethod.GET, "/api/board/**", "/api/songs/**", "/api/posts/**").permitAll()

                // View 관련 (혹시 사용한다면) 허용
                .requestMatchers("/view/**", "/error", "/").permitAll()

                // 그 외 모든 요청은 인증 필요
                .anyRequest().authenticated());

        http.addFilterBefore(new JwtAuthenticationFilter(jwtUtil, userRepository),
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();

        // 모든 Vercel 도메인 및 로컬 개발 환경 허용 (와일드카드 패턴 사용)
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "https://*.vercel.app",
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:5175"));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.addExposedHeader("Authorization");

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
