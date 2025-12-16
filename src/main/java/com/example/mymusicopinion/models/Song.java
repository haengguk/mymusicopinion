package com.example.mymusicopinion.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Song {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @jakarta.persistence.Column(unique = true)
    private Long itunesTrackId; // iTunes Unique ID

    private String artist;
    private String title;
    private String album;
    private String imageUrl;
    private String genre;
    private int releaseYear;
    @jakarta.persistence.Column(nullable = false, columnDefinition = "integer default 0")
    private int likeCount = 0;

    @jakarta.persistence.Column(nullable = false, columnDefinition = "double default 0.0")
    private double averageRating = 0.0;

    @jakarta.persistence.Column(nullable = false, columnDefinition = "integer default 0")
    private int reviewCount = 0;
}
