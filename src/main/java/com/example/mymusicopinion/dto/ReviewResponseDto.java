package com.example.mymusicopinion.dto;

import com.example.mymusicopinion.models.Review;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ReviewResponseDto {
    private Long id;
    private byte rating;
    private String comment;
    private LocalDateTime createdAt;
    private Long userId;
    private String username;
    private int likeCount;

    // Song Info
    private Long songId;
    private String songTitle;
    private String songArtist;
    private String songImageUrl;

    public static ReviewResponseDto from(Review review) {
        ReviewResponseDto dto = new ReviewResponseDto();
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setLikeCount(review.getLikeCount());

        if (review.getUser() != null) {
            dto.setUserId(review.getUser().getId());
            dto.setUsername(review.getUser().getUsername());
        }

        if (review.getSong() != null) {
            dto.setSongId(review.getSong().getId());
            dto.setSongTitle(review.getSong().getTitle());
            dto.setSongArtist(review.getSong().getArtist());
            dto.setSongImageUrl(review.getSong().getImageUrl());
        }
        return dto;
    }
}
