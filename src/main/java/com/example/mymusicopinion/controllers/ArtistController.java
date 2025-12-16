package com.example.mymusicopinion.controllers;

import com.example.mymusicopinion.dto.ItunesResponseDto;
import com.example.mymusicopinion.models.Song;
import com.example.mymusicopinion.repositories.SongRepository;
import com.example.mymusicopinion.services.MusicSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artists")
public class ArtistController {

    private final MusicSearchService musicSearchService;
    private final SongRepository songRepository;

    public ArtistController(MusicSearchService musicSearchService, SongRepository songRepository) {
        this.musicSearchService = musicSearchService;
        this.songRepository = songRepository;
    }

    @GetMapping("/{artistName}/albums")
    public ResponseEntity<List<ItunesResponseDto.ItunesResultDto>> getArtistAlbums(
            @PathVariable("artistName") String artistName) {
        List<ItunesResponseDto.ItunesResultDto> albums = musicSearchService.getArtistAlbums(artistName);
        return ResponseEntity.ok(albums);
    }

    @GetMapping("/{artistName}/top-tracks")
    public ResponseEntity<List<Song>> getArtistTopTracks(@PathVariable("artistName") String artistName) {
        List<Song> topSongs = songRepository.findTop10ByArtistContainingIgnoreCaseOrderByAverageRatingDesc(artistName);
        return ResponseEntity.ok(topSongs);
    }
}
