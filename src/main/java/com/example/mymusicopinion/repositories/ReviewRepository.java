package com.example.mymusicopinion.repositories;

import com.example.mymusicopinion.models.Review;
import com.example.mymusicopinion.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findBySongId(Long songId, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.song.id = :songId")
    List<Review> findBySongId(@Param("songId") Long songId,
            Sort sort);

    boolean existsBySongIdAndUserId(Long songId, Long userId);

    List<Review> findByUserOrderByCreatedAtDesc(User user);
}
