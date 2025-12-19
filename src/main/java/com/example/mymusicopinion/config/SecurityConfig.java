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
        // 비밀번호 암호화에 사용할 인코더를 BCrypt로 지정
        // BCrypt 해싱 함수(BCrypt hashing function)를 사용해서 비밀번호를 인코딩해주는 메서드와 사용자의 의해 제출된
        // 비밀번호와
        // 저장소에 저장되어 있는 비밀번호의 일치 여부를 확인해주는 메서드를 제공
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // CSRF(Cross-Site Request Forgery) 보호 비활성화 (JWT 사용 시 보통 비활성화)
        http.csrf(csrf -> csrf.disable());

        // 세션을 사용하지 않고, JWT를 통해 인증하므로 세션 정책을 STATELESS로 설정
        http.sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // API 요청에 대한 접근 권한 설정
        http.authorizeHttpRequests(authz -> authz
                // 정적 리소스에 대한 요청 모두 허용
                .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()

                // 회원가입, 로그인 API는 인증 없이 접근 허용
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/view/auth/**", "/songs/view", "/error").permitAll()
                // GET 요청 중에서 '/songs' 나 '/board' 로 시작하는 API는 인증
                .requestMatchers(HttpMethod.GET, "/songs/**", "/board/**").permitAll()
                .anyRequest().authenticated());

        http.addFilterBefore(new JwtAuthenticationFilter(jwtUtil, userRepository),
                UsernamePasswordAuthenticationFilter.class);

        return http.build();

    }
}
