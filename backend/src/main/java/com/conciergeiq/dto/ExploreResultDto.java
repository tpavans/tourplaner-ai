package com.conciergeiq.dto;

import com.conciergeiq.entity.Event;
import com.conciergeiq.entity.Hotel;
import com.conciergeiq.entity.Restaurant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExploreResultDto {
    private List<Hotel> hotels;
    private List<Restaurant> restaurants;
    private List<Event> events;
}
