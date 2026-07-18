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

        List<RecommendationCard> recommendations = new ArrayList<>();
        ItineraryProposalDto proposal = null;
        String responseText;

        String queryLower = message.toLowerCase();

        // 1. Check if user is asking about Ravulapalem
        if (queryLower.contains("ravulapalem")) {
            responseText = "I've structured a custom dining and leisure itinerary for your evening in Ravulapalem, Konaseema. The weather is currently clear and warm. Here are my top local suggestions for you tonight:";

            recommendations.add(RecommendationCard.builder()
                    .id(201L)
                    .title("Konaseema Ruchulu Restaurant")
                    .description("Authentic spicy Andhra delicacies, biryanis, and traditional curries.")
                    .category("Andhra Meals")
                    .rating(4.8)
                    .distance("0.5 km")
                    .imageUrl("https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80")
                    .type("RESTAURANT")
                    .build());

            recommendations.add(RecommendationCard.builder()
                    .id(202L)
                    .title("Godavari River Ghats & Boating")
                    .description("Enjoy a relaxing evening boat ride along the scenic Godavari River shoreline.")
                    .category("Leisure")
                    .rating(4.6)
                    .distance("2.3 km")
                    .imageUrl("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80")
                    .type("ATTRACTION")
                    .build());

            // Build schedule timeline (Ravulapalem coordinates base: 16.7490, 81.8440)
            List<ProposedActivity> activities = new ArrayList<>();
            activities.add(ProposedActivity.builder()
                    .time("07:00 PM")
                    .name("Dinner at Konaseema Ruchulu")
                    .type("RESTAURANT")
                    .activityId(201L)
                    .lat(16.7485)
                    .lng(81.8435)
                    .build());
            
            activities.add(ProposedActivity.builder()
                    .time("08:30 PM")
                    .name("Scenic Walk at Godavari River Ghats")
                    .type("ATTRACTION")
                    .activityId(202L)
                    .lat(16.7550)
                    .lng(81.8310)
                    .build());

            proposal = ItineraryProposalDto.builder()
                    .title("Evening Dinner in Ravulapalem")
                    .destination("Ravulapalem, AP")
                    .startDate(LocalDate.now().toString())
                    .endDate(LocalDate.now().toString())
                    .activities(activities)
                    .build();

        } else if (queryLower.contains("relax") || queryLower.contains("afternoon") || queryLower.contains("plan") || queryLower.contains("goa")) {
            // Default to Goa
            List<Restaurant> restaurants = restaurantRepository.findAll();
            List<Event> events = eventRepository.findAll();

            Restaurant selectedRestaurant = restaurants.stream()
                    .filter(r -> r.getCuisineType().equalsIgnoreCase("Seafood") || r.getCuisineType().equalsIgnoreCase("Mediterranean"))
                    .findFirst()
                    .orElse(restaurants.isEmpty() ? null : restaurants.get(0));

            Event selectedEvent = events.stream()
                    .filter(e -> e.getCategory().equalsIgnoreCase("MUSIC") || e.getCategory().equalsIgnoreCase("FOOD"))
                    .findFirst()
                    .orElse(events.isEmpty() ? null : events.get(0));

            responseText = "Here is a relaxing itinerary I've structured for your evening in Goa, considering your profile preferences. The weather is currently a comfortable 28°C. Would you like to confirm and book this plan?";

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

            // Goa coordinates (lat: 15.55, lng: 73.75)
            List<ProposedActivity> activities = new ArrayList<>();
            activities.add(ProposedActivity.builder()
                    .time("01:00 PM")
                    .name(selectedRestaurant != null ? selectedRestaurant.getName() : "Seaside Lunch")
                    .type("RESTAURANT")
                    .activityId(selectedRestaurant != null ? selectedRestaurant.getId() : null)
                    .lat(selectedRestaurant != null ? selectedRestaurant.getLatitude() : 15.5562)
                    .lng(selectedRestaurant != null ? selectedRestaurant.getLongitude() : 73.7512)
                    .build());
            
            activities.add(ProposedActivity.builder()
                    .time("03:30 PM")
                    .name("Scenic Beach Walk & Relaxation")
                    .type("LEISURE")
                    .lat(15.5992)
                    .lng(73.7431)
                    .build());
            
            activities.add(ProposedActivity.builder()
                    .time("06:30 PM")
                    .name(selectedEvent != null ? selectedEvent.getName() : "Sunset Cruise")
                    .type("EVENT")
                    .activityId(selectedEvent != null ? selectedEvent.getId() : null)
                    .lat(selectedEvent != null ? selectedEvent.getLatitude() : 15.5540)
                    .lng(selectedEvent != null ? selectedEvent.getLongitude() : 73.7562)
                    .build());

            proposal = ItineraryProposalDto.builder()
                    .title("Relaxing afternoon in Goa")
                    .destination("Goa, India")
                    .startDate(LocalDate.now().toString())
                    .endDate(LocalDate.now().toString())
                    .activities(activities)
                    .build();

        } else if (queryLower.contains("weather")) {
            responseText = "The weather in your current region is clear and pleasant, averaging 28°C. Perfect for dining out tonight!";
        } else {
            responseText = "I'm your ConciergeIQ travel assistant. Let me know what location and types of activities you want to plan (e.g. 'Plan dinner in Ravulapalem' or 'Suggest beach walks in Goa').";
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
