package com.example.mymusicopinion.dto;

import com.example.mymusicopinion.models.Post;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class PostResponseDto {
    private Long id;
    private String title;
    private String content;
    private String category;
    private LocalDateTime createdAt;
    private Long userId;
    private String username;
    private int commentCount;
    private int likeCount;

    // Song Info
    private Long songId;
    private String songTitle;
    private String songArtist;
    private String songImageUrl;

    public static PostResponseDto from(Post post) {
        PostResponseDto dto = new PostResponseDto();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setCategory(post.getCategory());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setLikeCount(post.getLikeCount());
        dto.setCommentCount(post.getCommentCount());
        if (post.getUser() != null) {
            dto.setUserId(post.getUser().getId());
            dto.setUsername(post.getUser().getUsername());
        }
        if (post.getSong() != null) {
            dto.setSongId(post.getSong().getId());
            dto.setSongTitle(post.getSong().getTitle());
            dto.setSongArtist(post.getSong().getArtist());
            dto.setSongImageUrl(post.getSong().getImageUrl());
        }
        return dto;
    }
}
