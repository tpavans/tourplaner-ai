package com.conciergeiq.controller;

import com.conciergeiq.entity.Hotel;
import com.conciergeiq.entity.Room;
import com.conciergeiq.repository.HotelRepository;
import com.conciergeiq.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HotelRoomController {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @GetMapping
    public ResponseEntity<List<Hotel>> getAllHotels() {
        return ResponseEntity.ok(hotelRepository.findAll());
    }

    @GetMapping("/{hotelId}/rooms")
    public ResponseEntity<List<Room>> getHotelRooms(@PathVariable Long hotelId) {
        return ResponseEntity.ok(roomRepository.findByHotelIdAndIsAvailableTrue(hotelId));
    }
}
