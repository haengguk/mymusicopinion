package com.example.mymusicopinion.services;

import com.example.mymusicopinion.dto.ReviewRequestDto;
import com.example.mymusicopinion.dto.ReviewResponseDto;
import com.example.mymusicopinion.exceptions.ResourceNotFoundException;
import com.example.mymusicopinion.models.Review;
import com.example.mymusicopinion.models.ReviewLike;
import com.example.mymusicopinion.models.Song;
import com.example.mymusicopinion.models.User;
import com.example.mymusicopinion.repositories.ReviewLikeRepository;
import com.example.mymusicopinion.repositories.ReviewRepository;
import com.example.mymusicopinion.repositories.SongRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final SongService songService;
    private final ReviewLikeRepository reviewLikeRepository;

    // 생성자를 통한 의존성 주입방식
    public ReviewService(ReviewRepository reviewRepository, SongService songService,
            ReviewLikeRepository reviewLikeRepository) {
        this.reviewRepository = reviewRepository;
        this.songService = songService;
        this.reviewLikeRepository = reviewLikeRepository;
    }

    @Transactional
    public Review addReview(ReviewRequestDto reviewRequestDto, User user) {
        // Find or create the song based on iTunes ID
        // Note: SongService instance is injecting from constructor
        // We need to make sure SongService has the method. Assuming previous step did
        // it.
        // Direct call to songRepository or songService? Better songService.

        // Circular dependency check: ReviewService depends on SongService? Yes.
        // Does SongService depend on ReviewService? No. So it is fine.

        Song song = songService.getOrCreateSong(reviewRequestDto);

        if (reviewRepository.existsBySongIdAndUserId(song.getId(), user.getId())) {
            throw new IllegalArgumentException("이미 이 노래에 대한 리뷰를 작성하셨습니다.");
        }

        Review review = new Review();
        review.setSong(song);
        review.setRating((byte) reviewRequestDto.getRating());
        review.setComment(reviewRequestDto.getComment());
        review.setUser(user); // Set the user!

        Review savedReview = reviewRepository.save(review);
        songService.updateSongStats(song.getId());
        return savedReview;
    }

    public List<ReviewResponseDto> getReviewBySong(Long songId, String sort) {
        org.springframework.data.domain.Sort sortObj = org.springframework.data.domain.Sort
                .by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt");

        if ("likes".equals(sort)) {
            sortObj = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,
                    "likeCount");
        }

        return reviewRepository.findBySongId(songId, sortObj)
                .stream()
                .map(ReviewResponseDto::from)
                .toList();
    }

    public Review updateReview(Long id, @RequestBody ReviewRequestDto reviewRequestDto) {
        Review updateReview = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("해당 리뷰가 없습니다"));

        updateReview.setComment(reviewRequestDto.getComment());
        updateReview.setRating((byte) reviewRequestDto.getRating());

        Review savedReview = reviewRepository.save(updateReview);
        songService.updateSongStats(updateReview.getSong().getId());
        return savedReview;
    }

    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("해당 리뷰가 없습니다."));
        Long songId = review.getSong().getId();

        reviewRepository.delete(review);
        songService.updateSongStats(songId);
    }

    public Page<Review> getReviewBySongId(Long songId, Pageable pageable) {
        return reviewRepository.findBySongId(songId, pageable);
    }

    @Transactional
    public void toggleReviewLike(Long reviewId, User user) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 리뷰가 없습니다"));

        java.util.Optional<ReviewLike> existingLike = reviewLikeRepository
                .findByReviewAndUser(review, user);

        if (existingLike.isPresent()) {
            reviewLikeRepository.delete(existingLike.get());
            review.setLikeCount(Math.max(0, review.getLikeCount() - 1));
        } else {
            reviewLikeRepository.save(new ReviewLike(user, review));
            review.setLikeCount(review.getLikeCount() + 1);
        }
    }

    public Page<ReviewResponseDto> getAllReviews(Pageable pageable) {
        return reviewRepository.findAll(pageable).map(ReviewResponseDto::from);
    }
}