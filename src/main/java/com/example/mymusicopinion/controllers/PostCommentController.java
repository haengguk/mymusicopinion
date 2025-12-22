package com.example.mymusicopinion.controllers;

import com.example.mymusicopinion.dto.PostCommentRequestDto;
import com.example.mymusicopinion.models.PostComment;
import com.example.mymusicopinion.services.PostCommentService;
import com.example.mymusicopinion.services.PostService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.mymusicopinion.dto.PostCommentResponseDto;

@RestController
@RequestMapping("/api/board/{postId}/comments")
public class PostCommentController {

    private final PostService postService;
    private final PostCommentService postCommentService;

    public PostCommentController(PostService postService, PostCommentService postCommentService) {
        this.postService = postService;
        this.postCommentService = postCommentService;
    }

    @PostMapping
    public ResponseEntity<PostCommentResponseDto> addComment(
            @PathVariable("postId") Long postId,
            @Valid @RequestBody PostCommentRequestDto postCommentRequestDto,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.example.mymusicopinion.security.UserDetailsImpl userDetails) {
        PostComment postComment = postCommentService.addComment(postId, postCommentRequestDto, userDetails.getUser());

        return ResponseEntity.status(HttpStatus.CREATED).body(PostCommentResponseDto.from(postComment));
    }

    @PostMapping("/{commentId}/like")
    public ResponseEntity<Void> likeComment(
            @PathVariable("postId") Long postId,
            @PathVariable("commentId") Long commentId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.example.mymusicopinion.security.UserDetailsImpl userDetails) {
        postCommentService.toggleCommentLike(commentId, userDetails.getUser());
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<Page<PostCommentResponseDto>> getPagedPostComments(
            @PathVariable("postId") Long postId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<PostCommentResponseDto> page = postCommentService.getCommentsByPostId(postId, pageable);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<PostCommentResponseDto> updateComment(
            @PathVariable("postId") Long postId,
            @PathVariable("commentId") Long commentId,
            @Valid @RequestBody PostCommentRequestDto postCommentRequestDto) {

        PostComment updatedComment = postCommentService
                .updateComment(commentId, postCommentRequestDto);

        return ResponseEntity.ok(PostCommentResponseDto.from(updatedComment));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable("postId") Long postId,
            @PathVariable("commentId") Long commentId) {

        postCommentService.deleteComment(postId, commentId);
        return ResponseEntity.noContent().build();
    }

}
