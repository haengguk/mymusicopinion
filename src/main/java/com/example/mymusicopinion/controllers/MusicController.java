package com.example.mymusicopinion.controllers;

import com.example.mymusicopinion.dto.ItunesResponseDto;
import com.example.mymusicopinion.services.MusicSearchService;
import com.example.mymusicopinion.services.YoutubeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/music")
public class MusicController {

    private final MusicSearchService musicSearchService;
    private final YoutubeService youtubeService;

    public MusicController(MusicSearchService musicSearchService,
            YoutubeService youtubeService) {
        this.musicSearchService = musicSearchService;
        this.youtubeService = youtubeService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<ItunesResponseDto.ItunesResultDto>> search(
            @RequestParam("term") String term,
            @RequestParam(value = "type", required = false) String type) {
        List<ItunesResponseDto.ItunesResultDto> results = musicSearchService.searchMusic(term, type);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/youtube-video")
    public ResponseEntity<String> getYoutubeVideoId(@RequestParam("term") String term) {
        String videoId = youtubeService.searchVideoId(term);
        // Return JSON: { "videoId": "..." }
        if (videoId != null) {
            return ResponseEntity.ok("{\"videoId\": \"" + videoId + "\"}");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
