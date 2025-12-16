package com.example.mymusicopinion.repositories;

import com.example.mymusicopinion.models.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByCategory(String category, Pageable pageable);

    java.util.List<Post> findByUserOrderByCreatedAtDesc(com.example.mymusicopinion.models.User user);
    // Page<Song> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    // Page<Song> findByArtistContainingIgnoreCase(String Artist, Pageable
    // pageable);
    // Page<Song> findByGenreIgnoreCase(String Genre, Pageable pageable);
}
