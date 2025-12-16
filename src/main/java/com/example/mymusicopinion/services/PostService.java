package com.example.mymusicopinion.services;

import com.example.mymusicopinion.dto.PostRequestDto;
import com.example.mymusicopinion.dto.PostResponseDto;
import com.example.mymusicopinion.exceptions.ResourceNotFoundException;
import com.example.mymusicopinion.models.Post;
import com.example.mymusicopinion.models.PostLike;
import com.example.mymusicopinion.models.Song;
import com.example.mymusicopinion.models.User;
import com.example.mymusicopinion.repositories.PostLikeRepository;
import com.example.mymusicopinion.repositories.PostRepository;
import com.example.mymusicopinion.repositories.SongRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final SongRepository songRepository;
    private final PostLikeRepository postLikeRepository;

    public PostService(PostRepository postRepository,
            SongRepository songRepository,
            PostLikeRepository postLikeRepository) {
        this.postRepository = postRepository;
        this.songRepository = songRepository;
        this.postLikeRepository = postLikeRepository;
    }

    @org.springframework.transaction.annotation.Transactional
    public void togglePostLike(Long postId, User user) {
        Post post = getPostById(postId);
        java.util.Optional<PostLike> existingLike = postLikeRepository
                .findByUserAndPost(user, post);

        if (existingLike.isPresent()) {
            postLikeRepository.delete(existingLike.get());
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
        } else {
            postLikeRepository.save(new PostLike(user, post));
            post.setLikeCount(post.getLikeCount() + 1);
        }
    }

    public Post addPost(PostRequestDto requestDto, User user) {
        Post post = new Post();
        post.setTitle(requestDto.getTitle());
        post.setContent(requestDto.getContent());
        post.setCategory(requestDto.getCategory() != null ? requestDto.getCategory() : "FREE");
        post.setCreatedAt(LocalDateTime.now());
        post.setUser(user);

        // Handle Song Recommendation
        if ("RECOMMEND".equals(post.getCategory()) && requestDto.getItunesTrackId() != null) {
            Song song = songRepository
                    .findByItunesTrackId(requestDto.getItunesTrackId())
                    .orElseGet(() -> {
                        Song newSong = new Song();
                        newSong.setItunesTrackId(requestDto.getItunesTrackId());
                        newSong.setTitle(requestDto.getSongTitle());
                        newSong.setArtist(requestDto.getSongArtist());
                        newSong.setImageUrl(requestDto.getSongImageUrl());
                        return songRepository.save(newSong);
                    });
            post.setSong(song);
        }

        return postRepository.save(post);
    }

    public Page<PostResponseDto> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable).map(PostResponseDto::from);
    }

    public Page<PostResponseDto> getPostsByCategory(String category, Pageable pageable) {
        return postRepository.findByCategory(category, pageable)
                .map(PostResponseDto::from);
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("해당 게시글이 없습니다"));
    }

    public void deletePostById(Long id) {
        if (!postRepository.existsById(id)) {
            throw new ResourceNotFoundException("해당 게시글이 없습니다.");
        }
        postRepository.deleteById(id);
    }

    public Post updatePostById(Long id, PostRequestDto postRequestDto) {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("해당 게시글이 없습니다."));

        existingPost.setTitle(postRequestDto.getTitle());
        existingPost.setContent(postRequestDto.getContent());
        // existingPost.setCreatedAt(LocalDateTime.now()); --> 이 부분은 처음 생성된 시간이기 때문에 건들지
        // 않기

        return postRepository.save(existingPost);
    }

    // public Page<Song> searchByTitle(String title, Pageable pageable) {
    // return songRepository.findByTitleContainingIgnoreCase(title, pageable);
    // }
    //
    // public Page<Song> searchByArtist(String artist, Pageable pageable) {
    // return songRepository.findByArtistContainingIgnoreCase(artist, pageable);
    // }
    //
    // public Page<Song> searchByGenre(String genre, Pageable pageable) {
    // return songRepository.findByGenreIgnoreCase(genre, pageable);
    // }
    //
    // public Song likeSong(Long id) {
    // // 노래가 없을 경우 예외처리
    // Song song = songRepository.findById(id)
    // .orElseThrow(() -> new IllegalArgumentException("해당 노래가 없습니다."));
    // // likeCount를 불러와 +1
    // song.setLikeCount(song.getLikeCount() + 1);
    // // 변경된 likeCount를 저장
    // return songRepository.save(song);
    // }
}
