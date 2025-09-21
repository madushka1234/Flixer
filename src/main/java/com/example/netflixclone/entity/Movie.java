package com.example.netflixclone.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private int year;

    private String genres;

    @Column(length = 2000)
    private String description;

    private String imageUrl;

    private String dropimageUrl;

    private String videoUrl;

    private String subtitleUrl;
}
