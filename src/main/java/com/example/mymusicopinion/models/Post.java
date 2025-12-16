package com.example.mymusicopinion.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Lob
    private String content;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String category = "FREE"; // FREE or RECOMMEND

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id")
    private Song song;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int likeCount = 0;

    @org.hibernate.annotations.Formula("(select count(*) from post_comment pc where pc.post_id = id)")
    private int commentCount;
}
