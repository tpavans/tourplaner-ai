package com.conciergeiq.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "event_tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(nullable = false)
    @Builder.Default
    private String status = "CONFIRMED"; // CONFIRMED, CANCELLED

    @CreationTimestamp
    @Column(name = "purchase_time", updatable = false)
    private OffsetDateTime purchaseTime;
}
