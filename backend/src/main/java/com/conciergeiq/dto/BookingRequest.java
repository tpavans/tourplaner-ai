package com.conciergeiq.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    private Long roomId;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private BigDecimal totalAmount;
}
