package com.example.mymusicopinion.services;

import com.example.mymusicopinion.config.JwtUtil;
import com.example.mymusicopinion.dto.LoginRequestDto;
import com.example.mymusicopinion.dto.SignupRequestDto;
import com.example.mymusicopinion.dto.UserResponseDto;
import com.example.mymusicopinion.dto.UserUpdateRequestDto;
import com.example.mymusicopinion.dto.ReviewResponseDto;
import com.example.mymusicopinion.dto.PostResponseDto;
import com.example.mymusicopinion.models.User;
import com.example.mymusicopinion.repositories.UserRepository;
import com.example.mymusicopinion.repositories.ReviewRepository;
import com.example.mymusicopinion.repositories.PostRepository;
import com.example.mymusicopinion.repositories.PostCommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private PostCommentRepository postCommentRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public void signup(SignupRequestDto signupRequestDto) {
        String username = signupRequestDto.getUsername();
        String password = passwordEncoder.encode(signupRequestDto.getPassword());

        userRepository.findByUsername(username)
                .ifPresent(user -> {
                    throw new IllegalArgumentException("중복된 사용자가 존재합니다.");
                });
        User user = new User(username, password);
        userRepository.save(user);
    }

    public String login(LoginRequestDto loginRequestDto) {
        String username = loginRequestDto.getUsername();
        String password = loginRequestDto.getPassword();

        User user = userRepository.findByUsername(username).orElseThrow(
                () -> new IllegalArgumentException("등록된 사용자가 없습니다."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        return jwtUtil.createJwtToken(user.getUsername());
    }

    public UserResponseDto getMyInfo(User user) {
        return UserResponseDto.from(user);
    }

    @Transactional
    public UserResponseDto updateUserInfo(User user, UserUpdateRequestDto requestDto) {
        // Reload user from DB to ensure persistent state
        User persistentUser = userRepository.findById(user.getId()).orElseThrow(
                () -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (requestDto.getPassword() != null && !requestDto.getPassword().isEmpty()) {
            persistentUser.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        }

        if (requestDto.getBio() != null) {
            persistentUser.setBio(requestDto.getBio());
        }

        userRepository.save(persistentUser);

        return UserResponseDto.from(persistentUser);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getMyReviews(User user) {
        return reviewRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(ReviewResponseDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<com.example.mymusicopinion.dto.BoardResponseDto> getMyPosts(User user) {
        return postRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(post -> {
                    com.example.mymusicopinion.dto.BoardResponseDto dto = com.example.mymusicopinion.dto.BoardResponseDto
                            .from(post);
                    dto.setCommentCount(postCommentRepository.findByPostId(post.getId()).size());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
