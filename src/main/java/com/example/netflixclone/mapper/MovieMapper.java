package com.example.netflixclone.mapper;

import com.example.netflixclone.dto.MovieDTO;
import com.example.netflixclone.entity.Movie;

public class MovieMapper {

    public static MovieDTO toDTO(Movie movie) {
        if (movie == null) return null;

        return MovieDTO.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .year(movie.getYear())
                .genres(movie.getGenres())
                .description(movie.getDescription())
                .imageUrl(movie.getImageUrl())
                .dropimageUrl(movie.getDropimageUrl())
                .videoUrl(movie.getVideoUrl())
                .subtitleUrl(movie.getSubtitleUrl())
                .build();
    }

    public static Movie toEntity(MovieDTO dto) {
        if (dto == null) return null;

        return Movie.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .year(dto.getYear())
                .genres(dto.getGenres())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .dropimageUrl(dto.getDropimageUrl())
                .videoUrl(dto.getVideoUrl())
                .subtitleUrl(dto.getSubtitleUrl())
                .build();
    }
}
