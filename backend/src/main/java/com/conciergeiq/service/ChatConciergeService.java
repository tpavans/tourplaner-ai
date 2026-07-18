package com.conciergeiq.service;

import com.conciergeiq.dto.ChatResponseDto;
import com.conciergeiq.dto.ChatResponseDto.ItineraryProposalDto;
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

    public ChatResponseDto processMessage(String message, Long userId) {
        logger.info("Processing message from user {}: {}", userId, message);

        // Run LangGraph multi-agent cooperative pipeline
        AgentState state = agentOrchestrator.runWorkflow(message, userId);

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
        String responseText = String.format("Hello! I have coordinated with my Planner, Itinerary, and Map agents to build a time-to-time itinerary for %s (Budget Limit: ₹%d) according to your preferences. The execution route and markers have been plotted on the live Google map.", 
                capitalizedLoc, state.getBudget());

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
