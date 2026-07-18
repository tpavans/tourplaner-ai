package com.conciergeiq.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "embeddings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Embedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "target_type", nullable = false)
    private String targetType; // ATTRACTION, RESTAURANT, EVENT

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(name = "description_chunk", columnDefinition = "TEXT", nullable = false)
    private String descriptionChunk;

    @Column(name = "vector_data", columnDefinition = "TEXT", nullable = false)
    private String vectorData; // Comma-separated floats representation

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
