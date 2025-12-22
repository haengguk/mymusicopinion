package com.example.mymusicopinion.controllers;

import com.example.mymusicopinion.dto.PostRequestDto;
import com.example.mymusicopinion.models.Post;
import com.example.mymusicopinion.models.User;
import com.example.mymusicopinion.security.UserDetailsImpl;
import com.example.mymusicopinion.services.PostCommentService;
import com.example.mymusicopinion.services.PostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/board")
public class PostController {

    @Autowired // 생략 가능
    private final PostService postService;
    private final PostCommentService postCommentService;

    public PostController(PostService postService, PostCommentService postCommentService) {
        this.postService = postService;
        this.postCommentService = postCommentService;
    }

    @PostMapping
    public ResponseEntity addPost(@Valid @RequestBody PostRequestDto postRequestDto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        // userDetails 객체를 통해 현재 로그인한 사용자의 정보를 알 수 있음
        User user = userDetails.getUser();

        Post newPost = postService.addPost(postRequestDto, user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(com.example.mymusicopinion.dto.PostResponseDto.from(newPost));
    }

    @GetMapping
    public Page<com.example.mymusicopinion.dto.PostResponseDto> getPagedPosts(
            @RequestParam(required = false) String category,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        if (category != null && !category.isEmpty()) {
            return postService.getPostsByCategory(category, pageable);
        }
        return postService.getAllPosts(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.example.mymusicopinion.dto.PostResponseDto> getPostById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(postService.getPostResponseDtoById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePostById(@PathVariable("id") Long id) {
        postService.deletePostById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePostById(
            @Valid @PathVariable("id") Long id,
            @RequestBody PostRequestDto postRequestDto) {
        Post updatedPost = postService.updatePostById(id, postRequestDto);
        return ResponseEntity.ok(updatedPost);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likePost(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        postService.togglePostLike(id, userDetails.getUser());
        return ResponseEntity.ok().build();
    }

    // @PutMapping("/{id}")
    // public ResponseEntity<Song> updateSong(@Valid @PathVariable("id") Long id,
    // @RequestBody SongRequestDto songRequestDto) {
    // Song updatedSong = songService.updateSongById(id, songRequestDto);
    // return ResponseEntity.ok(updatedSong);
    // }
    //
    // @GetMapping("/{id}/reviews")
    // public List<Review> getAllReviews(@PathVariable("id") Long id) {
    // return reviewService.getReviewBySong(id);
    // }
    //
    //
    // @GetMapping("/{id}")
    // public Page<Review> getReviewBySongPaged(
    // @PathVariable("id") Long songId,
    // @PageableDefault(size = 10, sort = "rating", direction = Sort.Direction.ASC)
    // Pageable pageable
    // ) {
    // return reviewService.getReviewBySongId(songId, pageable);
    // }
    //
    // @GetMapping("/search")
    // public Page<Song> searchSongs(
    // @RequestParam(required = false) String title,
    // @RequestParam(required = false) String artist,
    // @RequestParam(required = false) String genre,
    // Pageable pageable) {
    // if(title != null) {
    // return songService.searchByTitle(title, pageable);
    // } else if (artist != null) {
    // return songService.searchByArtist(artist, pageable);
    // } else if (genre != null) {
    // return songService.searchByGenre(genre, pageable);
    // }
    //
    // return songService.getSongs(pageable); // 조건이 아예 없을시
    // }
    //
    // @PutMapping("/{id}/like")
    // public ResponseEntity<Song> likeSong(@PathVariable Long id) {
    // Song updatedSong = songService.likeSong(id);
    // return ResponseEntity.ok(updatedSong);
    // }
}
