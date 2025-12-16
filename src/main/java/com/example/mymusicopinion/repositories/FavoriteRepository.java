package com.example.mymusicopinion.repositories;

import com.example.mymusicopinion.models.Favorite;
import com.example.mymusicopinion.models.Song;
import com.example.mymusicopinion.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    Optional<Favorite> findBySongAndUser(Song song, User user);

    boolean existsBySongAndUser(Song song, User user);

    void deleteBySongAndUser(Song song, User user);

    List<Favorite> findByUser(User user);
}
