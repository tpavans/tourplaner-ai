package com.conciergeiq.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleDto {
    private Long id;
    private Integer dayNumber;
    private LocalTime scheduledTime;
    private String activityName;
    private String activityType; // HOTEL, RESTAURANT, EVENT, ATTRACTION, LEISURE
    private Long activityId;
    private String status; // PLANNED, COMPLETED, CANCELLED
}
