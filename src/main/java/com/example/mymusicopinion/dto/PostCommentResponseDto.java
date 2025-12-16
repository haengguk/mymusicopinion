package com.example.mymusicopinion.dto;

import com.example.mymusicopinion.models.PostComment;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class PostCommentResponseDto {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private int likeCount;
    private Long userId;
    private String username;

    public static PostCommentResponseDto from(PostComment comment) {
        PostCommentResponseDto dto = new PostCommentResponseDto();
        dto.setId(comment.getId());
        dto.setContent(comment.getComment());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setLikeCount(comment.getLikeCount());

        if (comment.getUser() != null) {
            dto.setUserId(comment.getUser().getId());
            dto.setUsername(comment.getUser().getUsername());
        }

        return dto;
    }
}
