package com.example.netflixclone.service;

import com.example.netflixclone.dto.MovieDTO;
import com.example.netflixclone.entity.Movie;
import com.example.netflixclone.mapper.MovieMapper;
import com.example.netflixclone.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MovieService {
    private final MovieRepository movieRepository;

    public Page<MovieDTO> getAllMovies(int page, int size) {
        return movieRepository.findAll(PageRequest.of(page, size))
                .map(MovieMapper::toDTO);
    }

    public Optional<MovieDTO> getMovieById(Long id) {
        return movieRepository.findById(id).map(MovieMapper::toDTO);
    }

    public MovieDTO saveMovie(MovieDTO dto) {
        Movie movie = MovieMapper.toEntity(dto);
        return MovieMapper.toDTO(movieRepository.save(movie));
    }

    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }
}
