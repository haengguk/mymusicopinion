package com.example.mymusicopinion.repositories;

import com.example.mymusicopinion.models.Song;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SongRepository extends JpaRepository<Song, Long> {
    Page<Song> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Song> findByArtistContainingIgnoreCase(String Artist, Pageable pageable);

    Page<Song> findByGenreIgnoreCase(String Genre, Pageable pageable);

    java.util.Optional<Song> findByItunesTrackId(Long itunesTrackId);

    java.util.List<Song> findByItunesTrackIdIn(java.util.List<Long> itunesTrackIds);

    Page<Song> findByReviewCountGreaterThan(int count, Pageable pageable);

    java.util.List<Song> findTop10ByArtistContainingIgnoreCaseOrderByAverageRatingDesc(String artist);
}
