package com.example.netflixclone.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDTO {
    private String accessToken;
    private String role;   // ✅ role එකත් return කරන්න
}
