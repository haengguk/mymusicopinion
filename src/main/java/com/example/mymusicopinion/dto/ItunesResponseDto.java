package com.example.mymusicopinion.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ItunesResponseDto {
    private int resultCount;
    private List<ItunesResultDto> results;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ItunesResultDto {
        private String wrapperType;
        private String kind;
        private Long artistId;
        private Long collectionId;
        private Long trackId;
        private String artistName;
        private String collectionName;
        private String trackName;
        private String artworkUrl100; // 100x100 Image
        private String previewUrl; // 30s preview
        private String releaseDate;
        private String primaryGenreName;

        // Custom fields from DB
        private int reviewCount;
        private double averageRating;
    }
}
