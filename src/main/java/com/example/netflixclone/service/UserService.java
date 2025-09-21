package com.example.netflixclone.service;

import com.example.netflixclone.dto.RegisterDTO;
import com.example.netflixclone.entity.Role;
import com.example.netflixclone.entity.User;
import com.example.netflixclone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService implements UserServiceImpl {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // 🔐 Inject encoder

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }

    @Override
    public String createUser(RegisterDTO registerDTO) {


        if (userRepository.findByUsername(registerDTO.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(registerDTO.getUsername())
                .email(registerDTO.getEmail())   // ✅ FIXED (save email)
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .role(registerDTO.getRole() != null
                        ? Role.valueOf(registerDTO.getRole().toUpperCase())
                        : Role.USER)
                .build();

        userRepository.save(user);
        return "User Registration Success";


    }

    @Override
    public User updateUser(Long id, User updatedUser) {
        User existingUser = getUserById(id);
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setRole(updatedUser.getRole());
        // Password NOT updated here unless specifically handled
        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }


    public User addToMyList(Long userId, Long movieId) {
        User user = getUserById(userId);
        user.getMyList().add(movieId); // Set එකට add කරනවා
        return userRepository.save(user);
    }


    public User removeFromMyList(Long userId, Long movieId) {
        User user = getUserById(userId);
        user.getMyList().remove(movieId);
        return userRepository.save(user);
    }


    public Set<Long> getMyList(Long userId) {
        User user = getUserById(userId);
        return user.getMyList();
    }


    public User saveUser(User user) {
        return userRepository.save(user);
    }

}
