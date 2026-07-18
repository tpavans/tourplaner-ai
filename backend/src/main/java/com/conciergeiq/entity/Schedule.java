package com.conciergeiq.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalTime;
import java.time.OffsetDateTime;

@Entity
@Table(name = "schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @Column(name = "scheduled_time", nullable = false)
    private LocalTime scheduledTime;

    @Column(name = "activity_name", nullable = false)
    private String activityName;

    @Column(name = "activity_type", nullable = false)
    private String activityType; // HOTEL, RESTAURANT, EVENT, ATTRACTION, LEISURE

    @Column(name = "activity_id")
    private Long activityId;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PLANNED"; // PLANNED, COMPLETED, CANCELLED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
