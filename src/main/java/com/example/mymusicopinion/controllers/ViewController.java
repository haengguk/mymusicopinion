package com.example.mymusicopinion.controllers;

import com.example.mymusicopinion.dto.SongRequestDto;
import com.example.mymusicopinion.models.Song;
import com.example.mymusicopinion.services.SongService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;

@Controller
public class ViewController {

    private final SongService songService;

    public ViewController(SongService songService) {
        this.songService = songService;
    }

    @GetMapping("/songs/view")
    public String songView(Model model) {
        List<Song> songList = songService.getAllSongs();
        model.addAttribute("songs", songList);
        return "songs";
    }

    // @PostMapping("/songs/{id}/like")
    // public String likeSong(@PathVariable("id") Long id) {
    // songService.likeSong(id);
    // return "redirect:/songs/view";
    // }

    @GetMapping("/songs/new")
    public String showSongForm(Model model) {
        model.addAttribute("songRequestDto", new SongRequestDto());
        return "song-form";
    }

    @PostMapping("/songs/new")
    public String submitSong(@Valid @ModelAttribute SongRequestDto songRequestDto,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {

            return "song-form";
        }
        songService.addSong(songRequestDto.getTitle(),
                songRequestDto.getArtist(),
                songRequestDto.getGenre(),
                songRequestDto.getReleaseYear());

        return "redirect:/songs/view";
    }
}
