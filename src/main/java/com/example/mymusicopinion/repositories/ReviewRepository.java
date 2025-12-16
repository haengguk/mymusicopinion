package com.example.mymusicopinion.repositories;

import com.example.mymusicopinion.models.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.domain.Sort;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findBySongId(Long songId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM Review r WHERE r.song.id = :songId")
    java.util.List<Review> findBySongId(@org.springframework.data.repository.query.Param("songId") Long songId,
            org.springframework.data.domain.Sort sort);

    boolean existsBySongIdAndUserId(Long songId, Long userId);

    java.util.List<Review> findByUserOrderByCreatedAtDesc(com.example.mymusicopinion.models.User user);
}
