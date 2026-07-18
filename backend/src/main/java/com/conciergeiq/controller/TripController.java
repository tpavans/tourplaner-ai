package com.conciergeiq.controller;

import com.conciergeiq.dto.MessageResponse;
import com.conciergeiq.dto.ScheduleDto;
import com.conciergeiq.dto.TripDto;
import com.conciergeiq.security.UserDetailsImpl;
import com.conciergeiq.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TripController {

    @Autowired
    private TripService tripService;

    private Long getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public ResponseEntity<List<TripDto>> getAllTrips() {
        return ResponseEntity.ok(tripService.getTripsByUser(getCurrentUserId()));
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<TripDto> getTripById(@PathVariable Long tripId) {
        return ResponseEntity.ok(tripService.getTripById(tripId, getCurrentUserId()));
    }

    @PostMapping
    public ResponseEntity<TripDto> createTrip(@RequestBody TripDto dto) {
        return ResponseEntity.ok(tripService.createTrip(dto, getCurrentUserId()));
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<TripDto> updateTrip(@PathVariable Long tripId, @RequestBody TripDto dto) {
        return ResponseEntity.ok(tripService.updateTrip(tripId, dto, getCurrentUserId()));
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<MessageResponse> deleteTrip(@PathVariable Long tripId) {
        tripService.deleteTrip(tripId, getCurrentUserId());
        return ResponseEntity.ok(new MessageResponse("Trip deleted successfully"));
    }

    @PostMapping("/{tripId}/schedules")
    public ResponseEntity<ScheduleDto> addScheduleItem(@PathVariable Long tripId, @RequestBody ScheduleDto dto) {
        return ResponseEntity.ok(tripService.addScheduleItem(tripId, dto, getCurrentUserId()));
    }

    @DeleteMapping("/{tripId}/schedules/{scheduleId}")
    public ResponseEntity<MessageResponse> removeScheduleItem(@PathVariable Long tripId, @PathVariable Long scheduleId) {
        tripService.removeScheduleItem(tripId, scheduleId, getCurrentUserId());
        return ResponseEntity.ok(new MessageResponse("Schedule item removed successfully"));
    }
}
