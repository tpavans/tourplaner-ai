package com.conciergeiq.service;

import com.conciergeiq.dto.ChatResponseDto;
import com.conciergeiq.dto.ChatResponseDto.RecommendationCard;
import com.conciergeiq.dto.ChatResponseDto.ItineraryProposalDto;
import com.conciergeiq.dto.ChatResponseDto.ProposedActivity;
import com.conciergeiq.entity.*;
import com.conciergeiq.repository.*;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class ChatConciergeService {
    private static final Logger logger = LoggerFactory.getLogger(ChatConciergeService.class);

    @Value("${conciergeiq.openai.api-key}")
    private String apiKey;

    @Value("${conciergeiq.openai.model-name}")
    private String modelName;

    @Autowired
    private PreferenceProfileRepository preferenceProfileRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    public ChatResponseDto processMessage(String message, Long userId) {
        logger.info("Processing message from user {}: {}", userId, message);

        // Load Guest Profile & Preferences
        PreferenceProfile profile = preferenceProfileRepository.findByUserId(userId)
                .orElse(null);

        // Save User Message
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            chatHistoryRepository.save(ChatHistory.builder()
                    .user(user)
                    .role("USER")
                    .message(message)
                    .build());
        }

        // Emulate similarity vector search matches based on query terms
        List<RecommendationCard> recommendations = new ArrayList<>();
        ItineraryProposalDto proposal = null;
        String responseText;

        String queryLower = message.toLowerCase();

        if (queryLower.contains("relax") || queryLower.contains("afternoon") || queryLower.contains("plan")) {
            // Retrieve restaurants and events in Goa/Local
            List<Restaurant> restaurants = restaurantRepository.findAll();
            List<Event> events = eventRepository.findAll();

            // Match profiles: e.g. Veg / Seafood
            Restaurant selectedRestaurant = restaurants.stream()
                    .filter(r -> r.getCuisineType().equalsIgnoreCase("Seafood") || r.getCuisineType().equalsIgnoreCase("Italian"))
                    .findFirst()
                    .orElse(restaurants.isEmpty() ? null : restaurants.get(0));

            Event selectedEvent = events.stream()
                    .filter(e -> e.getCategory().equalsIgnoreCase("MUSIC") || e.getCategory().equalsIgnoreCase("FOOD"))
                    .findFirst()
                    .orElse(events.isEmpty() ? null : events.get(0));

            responseText = "Here is a relaxing itinerary I've structured for your afternoon in Goa, considering your profile preferences for coastal sights. The weather is currently a comfortable 28°C and roads are clear. Would you like to confirm and book this plan?";

            if (selectedRestaurant != null) {
                recommendations.add(RecommendationCard.builder()
                        .id(selectedRestaurant.getId())
                        .title(selectedRestaurant.getName())
                        .description("Indulge in coastal culinary experiences. Budget friendly.")
                        .category(selectedRestaurant.getCuisineType())
                        .rating(selectedRestaurant.getRating())
                        .distance("1.2 km")
                        .imageUrl(selectedRestaurant.getImageUrl())
                        .type("RESTAURANT")
                        .build());
            }

            if (selectedEvent != null) {
                recommendations.add(RecommendationCard.builder()
                        .id(selectedEvent.getId())
                        .title(selectedEvent.getName())
                        .description(selectedEvent.getDescription())
                        .category(selectedEvent.getCategory())
                        .rating(4.8)
                        .distance("3.5 km")
                        .imageUrl(selectedEvent.getImageUrl())
                        .type("EVENT")
                        .build());
            }

            // Create Proposed Itinerary
            List<ProposedActivity> activities = new ArrayList<>();
            activities.add(ProposedActivity.builder().time("01:00 PM").name(selectedRestaurant != null ? selectedRestaurant.getName() : "Seaside Lunch").type("RESTAURANT").activityId(selectedRestaurant != null ? selectedRestaurant.getId() : null).build());
            activities.add(ProposedActivity.builder().time("03:30 PM").name("Scenic Beach Walk & Relaxation").type("LEISURE").build());
            activities.add(ProposedActivity.builder().time("06:30 PM").name(selectedEvent != null ? selectedEvent.getName() : "Sunset Cruise").type("EVENT").activityId(selectedEvent != null ? selectedEvent.getId() : null).build());

            proposal = ItineraryProposalDto.builder()
                    .title("Relaxing afternoon in Goa")
                    .destination("Goa, India")
                    .startDate(LocalDate.now().toString())
                    .endDate(LocalDate.now().toString())
                    .activities(activities)
                    .build();

        } else if (queryLower.contains("weather")) {
            responseText = "The weather in Goa is currently 28°C with 65% humidity and a gentle breeze. Perfect for outdoor beach activities! No rain alerts for the next 6 hours.";
        } else {
            responseText = "I'm your ConciergeIQ assistant. Tell me what type of activity you are in the mood for (e.g., 'I want a relaxing afternoon' or 'suggest seafood restaurants nearby'), and I'll build a tailored itinerary for you!";
        }

        // Call OpenAI model if key is provided and not "demo"
        if (apiKey != null && !apiKey.equals("demo") && !apiKey.isEmpty()) {
            try {
                ChatLanguageModel chatModel = OpenAiChatModel.builder()
                        .apiKey(apiKey)
                        .modelName(modelName)
                        .temperature(0.7)
                        .build();

                String systemPrompt = "You are a luxury AI concierge for ConciergeIQ. Recommend spots and structure responses clearly. Current user preferences: "
                        + (profile != null ? profile.getInterests().toString() : "None");
                
                String modelResponse = chatModel.generate(systemPrompt + "\nUser asks: " + message);
                if (modelResponse != null && !modelResponse.trim().isEmpty()) {
                    responseText = modelResponse;
                }
            } catch (Exception e) {
                logger.error("Error invoking OpenAI chat model: {}", e.getMessage());
                // Fallback to rule-based responseText
            }
        }

        // Save AI Response to Chat History
        if (user != null) {
            chatHistoryRepository.save(ChatHistory.builder()
                    .user(user)
                    .role("ASSISTANT")
                    .message(responseText)
                    .build());
        }

        return ChatResponseDto.builder()
                .responseMessage(responseText)
                .recommendations(recommendations)
                .proposedItinerary(proposal)
                .build();
    }

    public List<ChatHistory> getChatHistory(Long userId) {
        return chatHistoryRepository.findByUserIdOrderByTimestampAsc(userId);
    }
}
