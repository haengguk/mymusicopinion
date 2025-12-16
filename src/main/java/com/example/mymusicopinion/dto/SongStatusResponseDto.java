package com.example.mymusicopinion.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SongStatusResponseDto {
    private boolean liked;
    private boolean favorited;
    private boolean reviewed;
}
