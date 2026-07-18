package com.conciergeiq.controller;

import com.conciergeiq.dto.ChatRequestDto;
import com.conciergeiq.dto.ChatResponseDto;
import com.conciergeiq.dto.ChatResponseDto.ItineraryProposalDto;
import com.conciergeiq.dto.MessageResponse;
import com.conciergeiq.entity.ChatHistory;
import com.conciergeiq.entity.Trip;
import com.conciergeiq.security.UserDetailsImpl;
import com.conciergeiq.service.ChatConciergeService;
import com.conciergeiq.service.OpenClawBookingAgent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatController {

    @Autowired
    private ChatConciergeService chatConciergeService;

    @Autowired
    private OpenClawBookingAgent openClawBookingAgent;

    private Long getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @PostMapping
    public ResponseEntity<ChatResponseDto> sendMessage(@RequestBody ChatRequestDto request) {
        return ResponseEntity.ok(chatConciergeService.processMessage(
                request.getMessage(), 
                request.getCurrentLocation(), 
                getCurrentUserId()
        ));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatHistory>> getChatHistory() {
        return ResponseEntity.ok(chatConciergeService.getChatHistory(getCurrentUserId()));
    }

    @PostMapping("/itinerary/approve")
    public ResponseEntity<?> approveItinerary(@RequestBody ItineraryProposalDto proposal) {
        Trip trip = openClawBookingAgent.executeProposedItinerary(proposal, getCurrentUserId());
        return ResponseEntity.ok(new MessageResponse("Itinerary approved and booked. Trip ID: " + trip.getId()));
    }
}
