package com.example.netflixclone.dto;

import lombok.Data;

@Data
public class RegisterDTO {
    private String username;
    private String email;   // ✅ FIXED
    private String password;
    private String role; // USER or ADMIN
}
