package com.conciergeiq.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category; // MUSIC, SPORTS, FOOD, MUSEUMS, NIGHTLIFE, ADVENTURE

    @Column(name = "date_time", nullable = false)
    private OffsetDateTime dateTime;

    @Column(nullable = false)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "image_url")
    private String imageUrl;

    private Double latitude;
    private Double longitude;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
