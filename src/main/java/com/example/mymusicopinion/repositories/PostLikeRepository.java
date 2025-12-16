package com.example.mymusicopinion.repositories;

import com.example.mymusicopinion.models.Post;
import com.example.mymusicopinion.models.PostLike;
import com.example.mymusicopinion.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByUserAndPost(User user, Post post);

    boolean existsByUserAndPost(User user, Post post);
}
