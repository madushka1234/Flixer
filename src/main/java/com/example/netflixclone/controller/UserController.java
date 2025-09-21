package com.example.netflixclone.controller;

import com.example.netflixclone.dto.ApiResponse;
import com.example.netflixclone.dto.RegisterDTO;
import com.example.netflixclone.entity.User;
import com.example.netflixclone.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5500") // ✅ adjust if frontend port differs
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createUser(@RequestBody RegisterDTO registerDTO) {
//        return ResponseEntity.ok(userService.createUser(registerDTO));

        if (registerDTO.getRole() == null) {
            registerDTO.setRole("USER");
        }
        return ResponseEntity.ok(new ApiResponse(
                200,
                "OK",
                userService.createUser(registerDTO)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
    @GetMapping("/stats")
    public Map<String, Long> getUserStats() {
        long totalUsers = userService.getAllUsers().size();
        long adminUsers = userService.getAllUsers().stream()
                .filter(user -> user.getRole().name().equals("ADMIN"))
                .count();
        long normalUsers = userService.getAllUsers().stream()
                .filter(user -> user.getRole().name().equals("USER"))
                .count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("adminUsers", adminUsers);
        stats.put("normalUsers", normalUsers);

        return stats;
    }

    // GET user My List
    @GetMapping("/{id}/mylist")
    public ResponseEntity<Set<Long>> getMyList(@PathVariable Long id) {
        Set<Long> myList = userService.getMyList(id);
        return ResponseEntity.ok(myList);
    }

    // PUT add movie to My List
    @PutMapping("/{id}/mylist/{movieId}")
    public ResponseEntity<User> addMovieToMyList(@PathVariable Long id, @PathVariable Long movieId) {
        User updatedUser = userService.addToMyList(id, movieId);
        return ResponseEntity.ok(updatedUser);
    }

    // DELETE remove movie from My List
    @DeleteMapping("/{id}/mylist/{movieId}")
    public ResponseEntity<User> removeMovieFromMyList(@PathVariable Long id, @PathVariable Long movieId) {
        User updatedUser = userService.removeFromMyList(id, movieId);
        return ResponseEntity.ok(updatedUser);
    }


}
