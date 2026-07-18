package com.conciergeiq.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "preference_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreferenceProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "profile_interests", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "interest")
    @Builder.Default
    private List<String> interests = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "profile_food_preferences", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "food_preference")
    @Builder.Default
    private List<String> foodPreferences = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "profile_accommodation_preferences", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "accommodation_preference")
    @Builder.Default
    private List<String> accommodationPreferences = new ArrayList<>();

    @Column(name = "budget_tier")
    @Builder.Default
    private String budgetTier = "MEDIUM"; // LOW, MEDIUM, HIGH

    @Column(name = "mobility_level")
    @Builder.Default
    private String mobilityLevel = "STANDARD"; // STANDARD, REDUCED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
