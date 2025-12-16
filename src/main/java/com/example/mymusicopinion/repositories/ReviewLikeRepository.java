package com.example.mymusicopinion.repositories;

import com.example.mymusicopinion.models.ReviewLike;
import com.example.mymusicopinion.models.Review;
import com.example.mymusicopinion.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {
    Optional<ReviewLike> findByReviewAndUser(Review review, User user);

    boolean existsByReviewAndUser(Review review, User user);

    void deleteByReviewAndUser(Review review, User user);
}
