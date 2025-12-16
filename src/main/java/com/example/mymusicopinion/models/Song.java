package com.example.mymusicopinion.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "songs")
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
    @jakarta.persistence.Column(nullable = false)
    private int likeCount = 0;

    @jakarta.persistence.Column(nullable = false)
    private double averageRating = 0.0;

    @jakarta.persistence.Column(nullable = false)
    private int reviewCount = 0;
}
