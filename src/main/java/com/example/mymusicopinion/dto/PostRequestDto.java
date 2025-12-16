package com.example.mymusicopinion.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostRequestDto {

    @NotBlank(message = "제목을 입력해주세요.")
    private String title;

    @NotBlank(message = "내용을 입력해주세요.")
    private String content;

    private String category; // Optional, defaults to FREE if null

    // For Song Recommendation
    private Long songId; // Internal DB ID if known
    private Long itunesTrackId; // iTunes ID (preferred for search)
    private String songTitle;
    private String songArtist;
    private String songImageUrl;
    private String previewUrl;
}
