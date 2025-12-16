package com.example.mymusicopinion.repositories;

import com.example.mymusicopinion.models.PostComment;
import com.example.mymusicopinion.models.PostCommentLike;
import com.example.mymusicopinion.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostCommentLikeRepository extends JpaRepository<PostCommentLike, Long> {
    Optional<PostCommentLike> findByUserAndPostComment(User user, PostComment postComment);

    boolean existsByUserAndPostComment(User user, PostComment postComment);
}
