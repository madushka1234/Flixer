package com.example.netflixclone.controller;

import lombok.RequiredArgsConstructor;

import com.example.netflixclone.dto.ApiResponse;
import com.example.netflixclone.dto.AuthDTO;
import com.example.netflixclone.dto.RegisterDTO;
import com.example.netflixclone.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(
            @RequestBody RegisterDTO registerDTO) {
        if (registerDTO.getRole() == null) {
            registerDTO.setRole("USER");
        }
        return ResponseEntity.ok(new ApiResponse(
                200,
                "OK",
                authService.register(registerDTO)));
    }
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(
            @RequestBody AuthDTO authDTO) {
        return ResponseEntity.ok(new ApiResponse(
                200,
                "OK",
                authService.authenticate(authDTO)));
    }
}
