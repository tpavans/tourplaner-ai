package com.conciergeiq.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "restaurants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "cuisine_type", nullable = false)
    private String cuisineType;

    @Column(name = "average_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal averagePrice;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(precision = 3, scale = 2)
    @Builder.Default
    private Double rating = 0.0;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "image_url")
    private String imageUrl;

    private Double latitude;
    private Double longitude;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
