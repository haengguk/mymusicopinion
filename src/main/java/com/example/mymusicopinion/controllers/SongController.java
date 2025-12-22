package com.example.mymusicopinion.controllers;

import com.example.mymusicopinion.dto.SongRequestDto;
import com.example.mymusicopinion.models.Review;
import com.example.mymusicopinion.models.Song;
import com.example.mymusicopinion.services.ReviewService;
import com.example.mymusicopinion.services.SongService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
public class SongController {

    @Autowired // 생략 가능
    private final SongService songService;
    private final ReviewService reviewService;

    public SongController(SongService songService, ReviewService reviewService) {
        this.songService = songService;
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity addSong(@Valid @RequestBody SongRequestDto songRequestDto) {
        Song savedSong = songService.addSong(
                songRequestDto.getTitle(),
                songRequestDto.getArtist(),
                songRequestDto.getGenre(),
                songRequestDto.getReleaseYear());

        return ResponseEntity.status(HttpStatus.CREATED).body(savedSong);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSong(@PathVariable("id") Long id) {
        songService.deleteSongById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Song> updateSong(@Valid @PathVariable("id") Long id,
            @RequestBody SongRequestDto songRequestDto) {
        Song updatedSong = songService.updateSongById(id, songRequestDto);
        return ResponseEntity.ok(updatedSong);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Song> getSongById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(songService.getSongById(id));
    }

    @GetMapping("/itunes/{itunesTrackId}")
    public ResponseEntity<Song> getSongByItunesId(@PathVariable("itunesTrackId") Long itunesTrackId) {
        // Need method in SongService
        return songService.getSongByItunesId(itunesTrackId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/reviews")
    public Page<com.example.mymusicopinion.dto.ReviewResponseDto> getReviewBySongPaged(
            @PathVariable("id") Long songId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return reviewService.getReviewBySongId(songId, pageable);
    }

    @GetMapping("/search")
    public Page<Song> searchSongs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String artist,
            @RequestParam(required = false) String genre,
            Pageable pageable) {
        if (title != null) {
            return songService.searchByTitle(title, pageable);
        } else if (artist != null) {
            return songService.searchByArtist(artist, pageable);
        } else if (genre != null) {
            return songService.searchByGenre(genre, pageable);
        }

        return songService.getSongs(pageable); // 조건이 아예 없을시
    }

    @GetMapping
    public Page<Song> getAllSongs(
            @RequestParam(required = false) Boolean hasReviews,
            @PageableDefault(size = 10) Pageable pageable) {
        return songService.getSongs(pageable, Boolean.TRUE.equals(hasReviews));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likeSong(
            @PathVariable("id") Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.example.mymusicopinion.security.UserDetailsImpl userDetails) {
        songService.toggleSongLike(id, userDetails.getUser());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<Void> favoriteSong(
            @PathVariable("id") Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.example.mymusicopinion.security.UserDetailsImpl userDetails) {
        songService.toggleFavorite(id, userDetails.getUser());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<com.example.mymusicopinion.dto.SongStatusResponseDto> getSongStatus(
            @PathVariable("id") Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.example.mymusicopinion.security.UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok(new com.example.mymusicopinion.dto.SongStatusResponseDto(false, false, false));
        }
        return ResponseEntity.ok(songService.getSongStatus(id, userDetails.getUser()));
    }
}
