package com.example.mymusicopinion.repositories;

import com.example.mymusicopinion.models.PostComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    List<PostComment> findByPostId(Long postId);
    Page<PostComment> findByPostId(Long postId, Pageable pageable);

}
