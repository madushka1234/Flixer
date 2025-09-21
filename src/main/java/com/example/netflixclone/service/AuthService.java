package com.example.netflixclone.service;

import lombok.RequiredArgsConstructor;
import com.example.netflixclone.dto.AuthDTO;
import com.example.netflixclone.dto.AuthResponseDTO;
import com.example.netflixclone.dto.RegisterDTO;
import com.example.netflixclone.entity.Role;
import com.example.netflixclone.entity.User;
import com.example.netflixclone.repository.UserRepository;
import com.example.netflixclone.util.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // 🔐 Login
    public AuthResponseDTO authenticate(AuthDTO authDTO) {
        User user = userRepository.findByUsername(authDTO.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Username not found"));

        if (!passwordEncoder.matches(authDTO.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Incorrect password");
        }

        String token = jwtUtil.generateToken(authDTO.getUsername());

        // ✅ return token + role
        return new AuthResponseDTO(token, user.getRole().name());
    }

    // 📝 Registration
    public String register(RegisterDTO registerDTO) {
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
}
