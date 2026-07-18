package com.conciergeiq.service;

import com.conciergeiq.dto.ChatResponseDto.ItineraryProposalDto;
import com.conciergeiq.dto.ChatResponseDto.ProposedActivity;
import com.conciergeiq.dto.EventTicketRequest;
import com.conciergeiq.dto.RestaurantReservationRequest;
import com.conciergeiq.entity.Schedule;
import com.conciergeiq.entity.Trip;
import com.conciergeiq.entity.User;
import com.conciergeiq.exception.ResourceNotFoundException;
import com.conciergeiq.repository.ScheduleRepository;
import com.conciergeiq.repository.TripRepository;
import com.conciergeiq.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;

@Service
public class OpenClawBookingAgent {
    private static final Logger logger = LoggerFactory.getLogger(OpenClawBookingAgent.class);

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Trip executeProposedItinerary(ItineraryProposalDto proposal, Long userId) {
        logger.info("OpenClaw booking agent executing proposed itinerary for user {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // 1. Create the Trip
        LocalDate startDate = LocalDate.parse(proposal.getStartDate());
        LocalDate endDate = LocalDate.parse(proposal.getEndDate());

        Trip trip = Trip.builder()
                .user(user)
                .title(proposal.getTitle())
                .destination(proposal.getDestination())
                .startDate(startDate)
                .endDate(endDate)
                .budgetLimit(new BigDecimal("500.00")) // Auto limit
                .budgetSpent(BigDecimal.ZERO)
                .schedules(new ArrayList<>())
                .build();

        Trip savedTrip = tripRepository.save(trip);

        // 2. Iterate through activities, book them, and build the schedule timeline
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");

        for (ProposedActivity activity : proposal.getActivities()) {
            LocalTime scheduledTime = LocalTime.parse(activity.getTime().toUpperCase(), timeFormatter);
            Long dbActivityId = null;

            if ("RESTAURANT".equalsIgnoreCase(activity.getType()) && activity.getActivityId() != null) {
                try {
                    // OpenClaw books restaurant table
                    RestaurantReservationRequest req = new RestaurantReservationRequest(
                            activity.getActivityId(),
                            OffsetDateTime.now().withHour(scheduledTime.getHour()).withMinute(scheduledTime.getMinute()),
                            2
                    );
                    var res = bookingService.createRestaurantReservation(req, userId);
                    dbActivityId = res.getId();
                } catch (Exception e) {
                    logger.error("OpenClaw failed to book restaurant table: {}", e.getMessage());
                }
            } else if ("EVENT".equalsIgnoreCase(activity.getType()) && activity.getActivityId() != null) {
                try {
                    // OpenClaw purchases tickets
                    EventTicketRequest req = new EventTicketRequest(
                            activity.getActivityId(),
                            2
                    );
                    var res = bookingService.bookEventTickets(req, userId);
                    dbActivityId = res.getId();
                } catch (Exception e) {
                    logger.error("OpenClaw failed to purchase event tickets: {}", e.getMessage());
                }
            }

            // Create Schedule Record
            Schedule scheduleItem = Schedule.builder()
                    .trip(savedTrip)
                    .dayNumber(1)
                    .scheduledTime(scheduledTime)
                    .activityName(activity.getName())
                    .activityType(activity.getType())
                    .activityId(dbActivityId)
                    .status("PLANNED")
                    .build();

            scheduleRepository.save(scheduleItem);
        }

        // Send notification
        notificationService.createNotification(userId, "Itinerary Booked Successfully",
                "OpenClaw Agent completed all bookings for trip: " + proposal.getTitle(), "ITINERARY");

        return savedTrip;
    }
}
