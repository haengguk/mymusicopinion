package com.example.mymusicopinion.dto;

import io.micrometer.common.lang.Nullable;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewRequestDto {

    // Song Info (for creation)
    @NotNull
    private Long itunesTrackId;
    private String title;
    private String artist;
    private String album;
    private String imageUrl;
    private int releaseYear;
    private String genre;

    // Review Info
    @Min(1)
    @Max(5)
    private int rating;

    @Nullable
    private String comment;
}
