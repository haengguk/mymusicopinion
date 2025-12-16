package com.example.mymusicopinion.repositories;

import com.example.mymusicopinion.models.SongLike;
import com.example.mymusicopinion.models.Song;
import com.example.mymusicopinion.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SongLikeRepository extends JpaRepository<SongLike, Long> {
    Optional<SongLike> findBySongAndUser(Song song, User user);

    boolean existsBySongAndUser(Song song, User user);

    void deleteBySongAndUser(Song song, User user);
}
