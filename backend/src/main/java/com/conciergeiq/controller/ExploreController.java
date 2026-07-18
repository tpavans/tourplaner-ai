package com.conciergeiq.controller;

import com.conciergeiq.dto.ExploreResultDto;
import com.conciergeiq.entity.Event;
import com.conciergeiq.entity.Hotel;
import com.conciergeiq.entity.Restaurant;
import com.conciergeiq.repository.EventRepository;
import com.conciergeiq.repository.HotelRepository;
import com.conciergeiq.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/explore")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ExploreController {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private EventRepository eventRepository;

    @GetMapping
    public ResponseEntity<ExploreResultDto> explore(@RequestParam(defaultValue = "Goa") String city) {
        List<Hotel> hotels = hotelRepository.findByCityIgnoreCase(city);
        if (hotels.isEmpty()) {
            hotels = hotelRepository.findAll();
        }

        List<Restaurant> restaurants = restaurantRepository.findByCityIgnoreCase(city);
        if (restaurants.isEmpty()) {
            restaurants = restaurantRepository.findAll();
        }

        List<Event> events = eventRepository.findByCityIgnoreCase(city);
        if (events.isEmpty()) {
            events = eventRepository.findAll();
        }

        return ResponseEntity.ok(new ExploreResultDto(hotels, restaurants, events));
    }
}
