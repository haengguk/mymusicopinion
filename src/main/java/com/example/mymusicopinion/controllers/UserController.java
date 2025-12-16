package com.example.mymusicopinion.controllers;

import com.example.mymusicopinion.dto.UserResponseDto;
import com.example.mymusicopinion.dto.UserUpdateRequestDto;
import com.example.mymusicopinion.security.UserDetailsImpl;
import com.example.mymusicopinion.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMyInfo(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getMyInfo(userDetails.getUser()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDto> updateMyInfo(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody UserUpdateRequestDto requestDto) {
        return ResponseEntity.ok(userService.updateUserInfo(userDetails.getUser(), requestDto));
    }

    @GetMapping("/me/reviews")
    public ResponseEntity<java.util.List<com.example.mymusicopinion.dto.ReviewResponseDto>> getMyReviews(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getMyReviews(userDetails.getUser()));
    }

    @GetMapping("/me/posts")
    public ResponseEntity<java.util.List<com.example.mymusicopinion.dto.BoardResponseDto>> getMyPosts(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getMyPosts(userDetails.getUser()));
    }
}
