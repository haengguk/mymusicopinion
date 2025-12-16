package com.example.mymusicopinion.services;

import com.example.mymusicopinion.dto.ItunesResponseDto;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class MusicSearchService {

    private final RestClient restClient;
    private final com.example.mymusicopinion.repositories.SongRepository songRepository;

    public MusicSearchService(RestClient.Builder builder,
            com.example.mymusicopinion.repositories.SongRepository songRepository) {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setSupportedMediaTypes(
                Arrays.asList(MediaType.APPLICATION_JSON, MediaType.valueOf("text/javascript")));

        this.restClient = builder
                .baseUrl("https://itunes.apple.com")
                .messageConverters(converters -> converters.add(converter))
                .build();
        this.songRepository = songRepository;
    }

    public List<ItunesResponseDto.ItunesResultDto> searchMusic(String term, String type) {
        if (term == null || term.trim().isEmpty()) {
            return Collections.emptyList();
        }

        System.out.println("🎵 [MusicSearchService] 검색 요청: " + term + ", 타입: " + type);

        ItunesResponseDto response = restClient.get()
                .uri(uriBuilder -> {
                    uriBuilder
                            .path("/search")
                            .queryParam("term", term)
                            .queryParam("media", "music")
                            .queryParam("limit", 100);

                    if ("song".equalsIgnoreCase(type)) {
                        uriBuilder.queryParam("attribute", "songTerm");
                    } else if ("artist".equalsIgnoreCase(type)) {
                        uriBuilder.queryParam("attribute", "artistTerm");
                    }

                    java.net.URI uri = uriBuilder.build();
                    System.out.println("🚀 [iTunes API] 생성된 URI: " + uri);
                    return uri;
                })
                .retrieve()
                .body(ItunesResponseDto.class);

        if (response == null || response.getResults() == null) {
            return Collections.emptyList();
        }

        List<ItunesResponseDto.ItunesResultDto> results = response.getResults();

        // 수동 필터링 (후처리)
        if (type != null && term != null) {
            final String lowerTerm = term.toLowerCase();
            if ("song".equalsIgnoreCase(type)) {
                results = results.stream()
                        .filter(r -> r.getTrackName() != null && r.getTrackName().toLowerCase().contains(lowerTerm))
                        .collect(java.util.stream.Collectors.toList());
                System.out.println("🧹 [Filter] 노래 제목으로 필터링됨. 남은 개수: " + results.size());
            } else if ("artist".equalsIgnoreCase(type)) {
                results = results.stream()
                        .filter(r -> r.getArtistName() != null && r.getArtistName().toLowerCase().contains(lowerTerm))
                        .collect(java.util.stream.Collectors.toList());
                System.out.println("🧹 [Filter] 아티스트 이름으로 필터링됨. 남은 개수: " + results.size());
            }
        }

        // DB 통계로 데이터 보강
        try {
            List<Long> trackIds = results.stream()
                    .map(ItunesResponseDto.ItunesResultDto::getTrackId)
                    .filter(java.util.Objects::nonNull)
                    .toList();

            if (!trackIds.isEmpty()) {
                List<com.example.mymusicopinion.models.Song> dbSongs = songRepository.findByItunesTrackIdIn(trackIds);
                java.util.Map<Long, com.example.mymusicopinion.models.Song> songMap = dbSongs.stream()
                        .collect(java.util.stream.Collectors
                                .toMap(com.example.mymusicopinion.models.Song::getItunesTrackId, song -> song));

                for (ItunesResponseDto.ItunesResultDto result : results) {
                    if (result.getTrackId() != null && songMap.containsKey(result.getTrackId())) {
                        com.example.mymusicopinion.models.Song dbSong = songMap.get(result.getTrackId());
                        result.setReviewCount(dbSong.getReviewCount());
                        result.setAverageRating(dbSong.getAverageRating());
                    }
                }
            }
        } catch (Exception e) {
            // 오류 로그 출력하지만 결과는 반환함
            System.err.println("검색 결과 보강 실패: " + e.getMessage());
        }

        return results;
    }

    public List<ItunesResponseDto.ItunesResultDto> getArtistAlbums(String artistName) {
        if (artistName == null || artistName.trim().isEmpty()) {
            return Collections.emptyList();
        }

        System.out.println("🎵 [MusicSearchService] 앨범 가져오기: " + artistName);

        ItunesResponseDto response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("term", artistName)
                        .queryParam("entity", "album")
                        .queryParam("limit", 10)
                        // iTunes API는 검색에 대해 'sort=recent'를 공식 지원하지 않음.
                        // 때때로 'attribute=releaseDate'가 작동하거나 기본값일 수 있음.
                        // 필요하다면 'attribute'를 추가하겠지만, entity=album이 핵심임.
                        .build())
                .retrieve()
                .body(ItunesResponseDto.class);

        if (response == null || response.getResults() == null) {
            return Collections.emptyList();
        }

        // Sort in memory by releaseDate desc if possible (optional but good for
        // 'Latest')
        List<ItunesResponseDto.ItunesResultDto> albums = response.getResults();
        albums.sort((a, b) -> {
            String dateA = a.getReleaseDate() != null ? a.getReleaseDate() : "";
            String dateB = b.getReleaseDate() != null ? b.getReleaseDate() : "";
            return dateB.compareTo(dateA); // 내림차순
        });

        return albums;
    }
}
