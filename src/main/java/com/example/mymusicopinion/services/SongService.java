package com.example.mymusicopinion.services;

import com.example.mymusicopinion.dto.ReviewRequestDto;
import com.example.mymusicopinion.dto.SongRequestDto;
import com.example.mymusicopinion.dto.SongStatusResponseDto;
import com.example.mymusicopinion.exceptions.BadRequestException;
import com.example.mymusicopinion.exceptions.ResourceNotFoundException;
import com.example.mymusicopinion.models.Favorite;
import com.example.mymusicopinion.models.Review;
import com.example.mymusicopinion.models.Song;
import com.example.mymusicopinion.models.SongLike;
import com.example.mymusicopinion.models.User;
import com.example.mymusicopinion.repositories.FavoriteRepository;
import com.example.mymusicopinion.repositories.ReviewRepository;
import com.example.mymusicopinion.repositories.SongLikeRepository;
import com.example.mymusicopinion.repositories.SongRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@Service
public class SongService {
    private final SongRepository songRepository;
    private final SongLikeRepository songLikeRepository;
    private final FavoriteRepository favoriteRepository;
    private final ReviewRepository reviewRepository;

    public SongService(
            SongRepository songRepository,
            SongLikeRepository songLikeRepository,
            FavoriteRepository favoriteRepository,
            ReviewRepository reviewRepository) {
        this.songRepository = songRepository;
        this.songLikeRepository = songLikeRepository;
        this.favoriteRepository = favoriteRepository;
        this.reviewRepository = reviewRepository;
    }

    public Song getOrCreateSong(ReviewRequestDto dto) {
        return songRepository.findByItunesTrackId(dto.getItunesTrackId())
                .orElseGet(() -> {
                    Song newSong = new Song();
                    newSong.setItunesTrackId(dto.getItunesTrackId());
                    newSong.setTitle(dto.getTitle());
                    newSong.setArtist(dto.getArtist());
                    newSong.setAlbum(dto.getAlbum());
                    newSong.setImageUrl(dto.getImageUrl());
                    newSong.setGenre(dto.getGenre() != null ? dto.getGenre() : "Pop");
                    newSong.setReleaseYear(dto.getReleaseYear());
                    return songRepository.save(newSong);
                });
    }

    public Song addSong(String title, String artist, String genre, int releaseYear) {
        Optional<Song> existingSong = songRepository.findAll()
                .stream()
                .filter(song -> song.getTitle().equals(title) &&
                        song.getTitle().equals(title))
                .findFirst();
        if (existingSong.isPresent()) {
            throw new BadRequestException("이미 등록된 노래입니다");
        }

        Song song = new Song();
        song.setTitle(title);
        song.setArtist(artist);
        song.setGenre(genre);
        song.setReleaseYear(releaseYear);

        return songRepository.save(song);
    }

    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }

    public Song getSongById(Long id) {
        return songRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("해당 노래가 없습니다"));
    }

    public Optional<Song> getSongByItunesId(Long itunesTrackId) {
        return songRepository.findByItunesTrackId(itunesTrackId);
    }

    public void deleteSongById(Long id) {
        if (!songRepository.existsById(id)) {
            throw new ResourceNotFoundException("해당 노래가 없습니다.");
        }

        songRepository.deleteById(id);
    }

    public Song updateSongById(Long id, SongRequestDto songRequestDto) {
        Song existingSong = songRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("해당 노래가 없습니다"));

        existingSong.setTitle(songRequestDto.getTitle());
        existingSong.setArtist(songRequestDto.getArtist());
        existingSong.setGenre(songRequestDto.getGenre());
        existingSong.setReleaseYear(songRequestDto.getReleaseYear());

        return songRepository.save(existingSong);
    }

    public Page<Song> getSongs(Pageable pageable) {
        return songRepository.findAll(pageable);
    }

    public Page<Song> getSongs(Pageable pageable, boolean onlyReviewed) {
        if (onlyReviewed) {
            return songRepository.findByReviewCountGreaterThan(0, pageable);
        }
        return songRepository.findAll(pageable);
    }

    public Page<Song> searchByTitle(String title, Pageable pageable) {
        return songRepository.findByTitleContainingIgnoreCase(title, pageable);
    }

    public Page<Song> searchByArtist(String artist, Pageable pageable) {
        return songRepository.findByArtistContainingIgnoreCase(artist, pageable);
    }

    public Page<Song> searchByGenre(String genre, Pageable pageable) {
        return songRepository.findByGenreIgnoreCase(genre, pageable);
    }

    @org.springframework.transaction.annotation.Transactional
    public void toggleSongLike(Long songId, User user) {
        Song song = getSongById(songId);

        Optional<SongLike> existingLike = songLikeRepository
                .findBySongAndUser(song, user);

        if (existingLike.isPresent()) {
            songLikeRepository.delete(existingLike.get());
            song.setLikeCount(Math.max(0, song.getLikeCount() - 1));
        } else {
            songLikeRepository.save(new SongLike(user, song));
            song.setLikeCount(song.getLikeCount() + 1);
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void toggleFavorite(Long songId, User user) {
        Song song = getSongById(songId);
        Optional<Favorite> existingFav = favoriteRepository
                .findBySongAndUser(song, user);

        if (existingFav.isPresent()) {
            favoriteRepository.delete(existingFav.get());
        } else {
            favoriteRepository.save(new Favorite(user, song));
        }
    }

    public SongStatusResponseDto getSongStatus(Long songId,
            User user) {
        Song song = getSongById(songId);
        boolean liked = songLikeRepository.existsBySongAndUser(song, user);
        boolean favorited = favoriteRepository.existsBySongAndUser(song, user);
        boolean reviewed = reviewRepository.existsBySongIdAndUserId(songId, user.getId());
        return new SongStatusResponseDto(liked, favorited, reviewed);
    }

    @EventListener(ApplicationReadyEvent.class)
    @org.springframework.transaction.annotation.Transactional
    public void syncAllSongStats() {
        java.util.List<Song> songs = songRepository.findAll();
        for (Song song : songs) {
            updateSongStats(song.getId());
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void updateSongStats(Long songId) {
        Song song = getSongById(songId);
        List<Review> reviews = reviewRepository.findBySongId(songId,
                org.springframework.data.domain.Sort.unsorted());

        int count = reviews.size();
        double avg = reviews.stream().mapToInt(Review::getRating).average()
                .orElse(0.0);

        // Round to 1 decimal place
        avg = Math.round(avg * 10.0) / 10.0;

        song.setReviewCount(count);
        song.setAverageRating(avg);
        songRepository.save(song);
    }
}
