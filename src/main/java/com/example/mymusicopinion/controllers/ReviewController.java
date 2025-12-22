package com.example.mymusicopinion.controllers;

import com.example.mymusicopinion.dto.ReviewRequestDto;
import com.example.mymusicopinion.models.Review;
import com.example.mymusicopinion.services.ReviewService;
import com.example.mymusicopinion.services.SongService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<Review> addReview(
            @Valid @RequestBody ReviewRequestDto reviewRequestDto,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.example.mymusicopinion.security.UserDetailsImpl userDetails) {

        Review savedReview = reviewService.addReview(reviewRequestDto, userDetails.getUser());

        return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(@Valid @PathVariable("id") Long id,
            @RequestBody ReviewRequestDto reviewRequestDto) {
        Review updateReview = reviewService.updateReview(id, reviewRequestDto);
        return ResponseEntity.ok(updateReview);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable("id") Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Object> getReviews(
            @RequestParam(value = "songId", required = false) Long songId,
            @RequestParam(value = "sort", required = false, defaultValue = "latest") String sort,
            @org.springframework.data.web.PageableDefault(size = 10) org.springframework.data.domain.Pageable pageable) {

        if (songId != null) {
            return ResponseEntity.ok(reviewService.getReviewBySong(songId, sort));
        }

        // Map Page<Review> to DTO if needed, or just return Page
        // ReviewResponseDto is cleaner
        org.springframework.data.domain.Page<com.example.mymusicopinion.dto.ReviewResponseDto> dtoPage = reviewService
                .getAllReviews(pageable);

        return ResponseEntity.ok(dtoPage);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likeReview(
            @PathVariable("id") Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.example.mymusicopinion.security.UserDetailsImpl userDetails) {
        reviewService.toggleReviewLike(id, userDetails.getUser());
        return ResponseEntity.ok().build();
    }
}
