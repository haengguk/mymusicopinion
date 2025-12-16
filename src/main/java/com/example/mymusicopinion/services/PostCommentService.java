package com.example.mymusicopinion.services;

import com.example.mymusicopinion.dto.PostCommentRequestDto;
import com.example.mymusicopinion.exceptions.BadRequestException;
import com.example.mymusicopinion.exceptions.ResourceNotFoundException;
import com.example.mymusicopinion.models.Post;
import com.example.mymusicopinion.models.PostComment;
import com.example.mymusicopinion.repositories.PostCommentRepository;
import com.example.mymusicopinion.repositories.PostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostCommentService {

    private final PostRepository postRepository;
    private final PostCommentRepository postCommentRepository;
    private final com.example.mymusicopinion.repositories.PostCommentLikeRepository postCommentLikeRepository;

    // 생성자를 통한 의존성 주입방식
    public PostCommentService(PostRepository postRepository, PostCommentRepository postCommentRepository,
            com.example.mymusicopinion.repositories.PostCommentLikeRepository postCommentLikeRepository) {
        this.postRepository = postRepository;
        this.postCommentRepository = postCommentRepository;
        this.postCommentLikeRepository = postCommentLikeRepository;
    }

    public PostComment addComment(Long postId, PostCommentRequestDto postCommentRequestDto,
            com.example.mymusicopinion.models.User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 게시글이 없습니다."));

        PostComment comment = new PostComment();
        comment.setPost(post);
        comment.setComment(postCommentRequestDto.getComment());
        comment.setUser(user);

        return postCommentRepository.save(comment);
    }

    @org.springframework.transaction.annotation.Transactional
    public void toggleCommentLike(Long commentId, com.example.mymusicopinion.models.User user) {
        PostComment comment = postCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 댓글이 없습니다."));

        java.util.Optional<com.example.mymusicopinion.models.PostCommentLike> existingLike = postCommentLikeRepository
                .findByUserAndPostComment(user, comment);

        if (existingLike.isPresent()) {
            postCommentLikeRepository.delete(existingLike.get());
            comment.setLikeCount(Math.max(0, comment.getLikeCount() - 1));
        } else {
            postCommentLikeRepository.save(new com.example.mymusicopinion.models.PostCommentLike(user, comment));
            comment.setLikeCount(comment.getLikeCount() + 1);
        }
    }

    public List<PostComment> getCommentsByPostId(Long postId) {
        return postCommentRepository.findByPostId(postId);
    }

    public Page<PostComment> getCommentsByPostId(Long postId, Pageable pageable) {
        postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 게시물이 없습니다."));
        return postCommentRepository.findByPostId(postId, pageable);
    }

    public PostComment updateComment(Long commentId, PostCommentRequestDto postCommentRequestDto) {
        PostComment comment = postCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 댓글이 없습니다."));

        comment.setComment(postCommentRequestDto.getComment());

        return postCommentRepository.save(comment);
    }

    public void deleteComment(Long postId, Long commentId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("해당 게시글이 없습니다.");
        }

        PostComment comment = postCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 댓글이 없습니다."));
        if (!comment.getPost().getId().equals(postId)) {
            throw new BadRequestException("해당 게시글의 댓글이 아닙니다.");
        }

        postCommentRepository.deleteById(commentId);
    }
}