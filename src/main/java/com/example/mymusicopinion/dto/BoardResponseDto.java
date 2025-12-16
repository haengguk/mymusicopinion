package com.example.mymusicopinion.dto;

import com.example.mymusicopinion.models.Post;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class BoardResponseDto {
    private Long id;
    private String title;
    private int commentCount;
    private int likeCount;
    private LocalDateTime createdAt;
    private String category;

    // Song Info (Optional for List)
    private String songTitle;
    private String songImageUrl;

    public static BoardResponseDto from(Post post) {
        BoardResponseDto dto = new BoardResponseDto();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setCategory(post.getCategory());
        dto.setLikeCount(post.getLikeCount());
        dto.setCreatedAt(post.getCreatedAt());

        if (post.getSong() != null) {
            dto.setSongTitle(post.getSong().getTitle());
            dto.setSongImageUrl(post.getSong().getImageUrl());
        }

        // commentCount needs to be set separately or via query
        return dto;
    }
}
