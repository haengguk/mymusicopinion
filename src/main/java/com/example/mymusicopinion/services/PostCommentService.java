package com.example.mymusicopinion.services;

import com.example.mymusicopinion.dto.PostCommentRequestDto;
import com.example.mymusicopinion.exceptions.BadRequestException;
import com.example.mymusicopinion.exceptions.ResourceNotFoundException;
import com.example.mymusicopinion.models.Post;
import com.example.mymusicopinion.models.PostComment;
import com.example.mymusicopinion.models.PostCommentLike;
import com.example.mymusicopinion.models.User;
import com.example.mymusicopinion.repositories.PostCommentLikeRepository;
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
    private final PostCommentLikeRepository postCommentLikeRepository;

    // 생성자를 통한 의존성 주입방식
    public PostCommentService(PostRepository postRepository, PostCommentRepository postCommentRepository,
            PostCommentLikeRepository postCommentLikeRepository) {
        this.postRepository = postRepository;
        this.postCommentRepository = postCommentRepository;
        this.postCommentLikeRepository = postCommentLikeRepository;
    }

    @org.springframework.transaction.annotation.Transactional
    public PostComment addComment(Long postId, PostCommentRequestDto postCommentRequestDto,
            User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 게시글이 없습니다."));

        PostComment comment = new PostComment();
        comment.setPost(post);
        comment.setComment(postCommentRequestDto.getComment());
        comment.setUser(user);

        post.setCommentCount(post.getCommentCount() + 1); // 댓글 수 증가
        // postRepository.save(post); // Transactional이 없으면 명시적 저장 필요하지만, 여기선
        // postCommentRepository.save와 별개이므로 저장 권장.
        // 또는 메서드에 @Transactional 추가

        return postCommentRepository.save(comment);
    }

    @org.springframework.transaction.annotation.Transactional
    public void toggleCommentLike(Long commentId, User user) {
        PostComment comment = postCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 댓글이 없습니다."));

        java.util.Optional<PostCommentLike> existingLike = postCommentLikeRepository
                .findByUserAndPostComment(user, comment);

        if (existingLike.isPresent()) {
            postCommentLikeRepository.delete(existingLike.get());
            comment.setLikeCount(Math.max(0, comment.getLikeCount() - 1));
        } else {
            postCommentLikeRepository.save(new PostCommentLike(user, comment));
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

    @org.springframework.transaction.annotation.Transactional
    public void deleteComment(Long postId, Long commentId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("해당 게시글이 없습니다.");
        }

        PostComment comment = postCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 댓글이 없습니다."));
        if (!comment.getPost().getId().equals(postId)) {
            throw new BadRequestException("해당 게시글의 댓글이 아닙니다.");
        }

        Post post = comment.getPost();
        post.setCommentCount(Math.max(0, post.getCommentCount() - 1));

        postCommentRepository.deleteById(commentId);
    }
}