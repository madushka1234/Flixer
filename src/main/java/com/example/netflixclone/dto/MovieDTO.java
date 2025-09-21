package com.example.netflixclone.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieDTO {
    private Long id;
    private String title;
    private int year;
    private String genres;
    private String description;
    private String imageUrl;
    private String dropimageUrl;
    private String videoUrl;
    private String subtitleUrl;
}
