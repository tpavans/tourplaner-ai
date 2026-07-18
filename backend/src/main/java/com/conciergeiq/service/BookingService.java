package com.conciergeiq.service;

import com.conciergeiq.dto.BookingRequest;
import com.conciergeiq.dto.EventTicketRequest;
import com.conciergeiq.dto.RestaurantReservationRequest;
import com.conciergeiq.entity.*;
import com.conciergeiq.exception.ResourceNotFoundException;
import com.conciergeiq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private EventTicketRepository eventTicketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private NotificationService notificationService;

    // --- Hotel Bookings ---

    public List<Booking> getHotelBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    @Transactional
    public Booking createHotelBooking(BookingRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + request.getRoomId()));

        long days = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        BigDecimal calculatedAmount = room.getPricePerNight().multiply(BigDecimal.valueOf(days));

        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .status("CONFIRMED")
                .totalAmount(calculatedAmount)
                .build();

        Booking saved = bookingRepository.save(booking);

        notificationService.createNotification(userId, "Hotel Booking Confirmed",
                "Your reservation at " + room.getHotel().getName() + " is confirmed.", "BOOKING");

        return saved;
    }

    @Transactional
    public void cancelHotelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        if (!booking.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized cancellation request.");
        }
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        notificationService.createNotification(userId, "Booking Cancelled",
                "Your booking for " + booking.getRoom().getHotel().getName() + " has been cancelled.", "BOOKING");
    }

    // --- Restaurant Reservations ---

    public List<Reservation> getRestaurantReservationsByUser(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    @Transactional
    public Reservation createRestaurantReservation(RestaurantReservationRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found: " + request.getRestaurantId()));

        Reservation reservation = Reservation.builder()
                .user(user)
                .restaurant(restaurant)
                .reservationTime(request.getReservationTime())
                .partySize(request.getPartySize())
                .status("CONFIRMED")
                .build();

        Reservation saved = reservationRepository.save(reservation);

        notificationService.createNotification(userId, "Restaurant Reserved",
                "Table reserved at " + restaurant.getName() + " for " + request.getPartySize() + " guests.", "BOOKING");

        return saved;
    }

    @Transactional
    public void cancelRestaurantReservation(Long reservationId, Long userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + reservationId));
        if (!reservation.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        reservation.setStatus("CANCELLED");
        reservationRepository.save(reservation);

        notificationService.createNotification(userId, "Reservation Cancelled",
                "Table reservation at " + reservation.getRestaurant().getName() + " cancelled.", "BOOKING");
    }

    // --- Event Ticket Bookings ---

    public List<EventTicket> getEventTicketsByUser(Long userId) {
        return eventTicketRepository.findByUserId(userId);
    }

    @Transactional
    public EventTicket bookEventTickets(EventTicketRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + request.getEventId()));

        EventTicket ticket = EventTicket.builder()
                .user(user)
                .event(event)
                .quantity(request.getQuantity())
                .status("CONFIRMED")
                .build();

        EventTicket saved = eventTicketRepository.save(ticket);

        notificationService.createNotification(userId, "Event Tickets Purchased",
                "Booked " + request.getQuantity() + " ticket(s) for " + event.getName() + ".", "BOOKING");

        return saved;
    }

    @Transactional
    public void cancelEventTickets(Long ticketId, Long userId) {
        EventTicket ticket = eventTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket booking not found: " + ticketId));
        if (!ticket.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        ticket.setStatus("CANCELLED");
        eventTicketRepository.save(ticket);

        notificationService.createNotification(userId, "Event Booking Cancelled",
                "Tickets cancelled for " + ticket.getEvent().getName() + ".", "BOOKING");
    }
}
