package com.conciergeiq.service;

import com.conciergeiq.dto.ChatResponseDto;
import com.conciergeiq.dto.ChatResponseDto.ItineraryProposalDto;
import com.conciergeiq.dto.ChatResponseDto.ProposedActivity;
import com.conciergeiq.agent.AgentOrchestrator;
import com.conciergeiq.agent.AgentState;
import com.conciergeiq.entity.ChatHistory;
import com.conciergeiq.entity.User;
import com.conciergeiq.repository.ChatHistoryRepository;
import com.conciergeiq.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ChatConciergeService {
    private static final Logger logger = LoggerFactory.getLogger(ChatConciergeService.class);

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AgentOrchestrator agentOrchestrator;

    public ChatResponseDto processMessage(String message, String currentLocation, Long userId) {
        logger.info("Processing message from user {}: {}", userId, message);

        // Execute dynamic LangGraph multi-agent orchestration workflow
        AgentState state = agentOrchestrator.runWorkflow(message, currentLocation, userId);

        // Save User Message to database
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            chatHistoryRepository.save(ChatHistory.builder()
                    .user(user)
                    .role("USER")
                    .message(message)
                    .build());
        }

        String capitalizedLoc = state.getLocation().substring(0, 1).toUpperCase() + state.getLocation().substring(1);
        String responseText = "";

        // Determine guide persona response text dynamically based on context
        boolean isEmergency = message.toLowerCase().contains("emergency") || message.toLowerCase().contains("hospital") || 
                              message.toLowerCase().contains("doctor") || message.toLowerCase().contains("accident") || 
                              message.toLowerCase().contains("medical");

        if (isEmergency) {
            responseText = "🚨 I detected a medical emergency query. I have instantly bypassed standard sightseeing and activated my emergency medical protocol. I located the nearest high-rated trauma care and mapped the shortest traffic-free route. Please proceed to the emergency ward immediately; details are loaded on your live tracking map.";
        } else if (state.getTripTitle().toLowerCase().contains("rain")) {
            responseText = String.format("☔ Hello! I checked the live weather for %s and detected rain/showers. To keep you comfortable, I have dynamically modified your plan to focus on premium indoor activities, including an indoor multiplex movie and dining. Safe and dry! Let me know if you would like me to book it.", capitalizedLoc);
        } else {
            responseText = String.format("☀️ Hello! I am your travel concierge. I checked the weather in %s and it looks clear! I have mapped out a beautiful outdoor itinerary featuring a scenic sunset sightseeing tour followed by a fine dinner at a top-rated restaurant. Let me know if this looks good and I can book the tickets for you!", capitalizedLoc);
        }

        // Save AI Response to Chat History
        if (user != null) {
            chatHistoryRepository.save(ChatHistory.builder()
                    .user(user)
                    .role("ASSISTANT")
                    .message(responseText)
                    .build());
        }

        ItineraryProposalDto proposal = ItineraryProposalDto.builder()
                .title(state.getTripTitle())
                .destination(capitalizedLoc)
                .startDate(LocalDate.now().toString())
                .endDate(LocalDate.now().toString())
                .activities(state.getActivities())
                .build();

        return ChatResponseDto.builder()
                .responseMessage(responseText)
                .recommendations(state.getRecommendations())
                .proposedItinerary(proposal)
                .agentLogs(state.getExecutionLogs())
                .build();
    }

    public List<ChatHistory> getChatHistory(Long userId) {
        return chatHistoryRepository.findByUserIdOrderByTimestampAsc(userId);
    }
}
