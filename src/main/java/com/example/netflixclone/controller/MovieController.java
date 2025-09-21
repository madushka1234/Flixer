package com.example.netflixclone.controller;

import com.example.netflixclone.dto.MovieDTO;
import com.example.netflixclone.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5500") // frontend port
public class MovieController {
    private final MovieService movieService;

    // 🔹 Get all movies (paginated)
    @GetMapping
    public ResponseEntity<Page<MovieDTO>> getAllMovies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        return ResponseEntity.ok(movieService.getAllMovies(page, size));
    }

    // 🔹 Get single movie
    @GetMapping("/{id}")
    public ResponseEntity<MovieDTO> getMovieById(@PathVariable Long id) {
        return movieService.getMovieById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 Add new movie
    @PostMapping
    public ResponseEntity<MovieDTO> createMovie(@RequestBody MovieDTO movieDTO) {
        return ResponseEntity.ok(movieService.saveMovie(movieDTO));
    }

    // 🔹 Update movie
    @PutMapping("/{id}")
    public ResponseEntity<MovieDTO> updateMovie(@PathVariable Long id, @RequestBody MovieDTO updatedMovie) {
        return movieService.getMovieById(id)
                .map(movie -> {
                    updatedMovie.setId(id);
                    return ResponseEntity.ok(movieService.saveMovie(updatedMovie));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 Delete movie
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }
}
