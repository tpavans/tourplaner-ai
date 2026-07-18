package com.conciergeiq.controller;

import com.conciergeiq.dto.BookingRequest;
import com.conciergeiq.dto.EventTicketRequest;
import com.conciergeiq.dto.MessageResponse;
import com.conciergeiq.dto.RestaurantReservationRequest;
import com.conciergeiq.entity.Booking;
import com.conciergeiq.entity.EventTicket;
import com.conciergeiq.entity.Reservation;
import com.conciergeiq.security.UserDetailsImpl;
import com.conciergeiq.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookingController {

    @Autowired
    private BookingService bookingService;

    private Long getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    // --- Hotel Stay Bookings ---

    @GetMapping("/hotel")
    public ResponseEntity<List<Booking>> getHotelBookings() {
        return ResponseEntity.ok(bookingService.getHotelBookingsByUser(getCurrentUserId()));
    }

    @PostMapping("/hotel")
    public ResponseEntity<Booking> createHotelBooking(@RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createHotelBooking(request, getCurrentUserId()));
    }

    @DeleteMapping("/hotel/{bookingId}")
    public ResponseEntity<MessageResponse> cancelHotelBooking(@PathVariable Long bookingId) {
        bookingService.cancelHotelBooking(bookingId, getCurrentUserId());
        return ResponseEntity.ok(new MessageResponse("Hotel stay booking cancelled."));
    }

    // --- Restaurant Reservations ---

    @GetMapping("/restaurant")
    public ResponseEntity<List<Reservation>> getRestaurantReservations() {
        return ResponseEntity.ok(bookingService.getRestaurantReservationsByUser(getCurrentUserId()));
    }

    @PostMapping("/restaurant")
    public ResponseEntity<Reservation> createRestaurantReservation(@RequestBody RestaurantReservationRequest request) {
        return ResponseEntity.ok(bookingService.createRestaurantReservation(request, getCurrentUserId()));
    }

    @DeleteMapping("/restaurant/{reservationId}")
    public ResponseEntity<MessageResponse> cancelRestaurantReservation(@PathVariable Long reservationId) {
        bookingService.cancelRestaurantReservation(reservationId, getCurrentUserId());
        return ResponseEntity.ok(new MessageResponse("Restaurant table reservation cancelled."));
    }

    // --- Event Bookings ---

    @GetMapping("/event")
    public ResponseEntity<List<EventTicket>> getEventTickets() {
        return ResponseEntity.ok(bookingService.getEventTicketsByUser(getCurrentUserId()));
    }

    @PostMapping("/event")
    public ResponseEntity<EventTicket> bookEventTickets(@RequestBody EventTicketRequest request) {
        return ResponseEntity.ok(bookingService.bookEventTickets(request, getCurrentUserId()));
    }

    @DeleteMapping("/event/{ticketId}")
    public ResponseEntity<MessageResponse> cancelEventTickets(@PathVariable Long ticketId) {
        bookingService.cancelEventTickets(ticketId, getCurrentUserId());
        return ResponseEntity.ok(new MessageResponse("Event ticket booking cancelled."));
    }
}
