package com.example.mymusicopinion.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class SongRequestDto {

    @NotBlank(message = "제목을 입력해주세요.")
    private String title;

    @NotBlank(message = "아티스트를 입력해주세요.")
    private String artist;

    @NotBlank(message = "장르를 입력해주세요.")
    private String genre;

    @Min(value = 1800, message = "발매 연도는 1800년 이상이어야 합니다.")
    @Max(value = 2026, message = "발매 연도는 2026년 이하이어야 합니다.")
    private int releaseYear;

}
