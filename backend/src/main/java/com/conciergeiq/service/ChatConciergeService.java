package com.conciergeiq.service;

import com.conciergeiq.dto.ChatResponseDto;
import com.conciergeiq.dto.ChatResponseDto.RecommendationCard;
import com.conciergeiq.dto.ChatResponseDto.ItineraryProposalDto;
import com.conciergeiq.dto.ChatResponseDto.ProposedActivity;
import com.conciergeiq.entity.*;
import com.conciergeiq.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ChatConciergeService {
    private static final Logger logger = LoggerFactory.getLogger(ChatConciergeService.class);

    @Autowired
    private PreferenceProfileRepository preferenceProfileRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    public ChatResponseDto processMessage(String message, Long userId) {
        logger.info("Processing message from user {}: {}", userId, message);

        // Retrieve existing database chat history for conversation memory
        List<ChatHistory> history = chatHistoryRepository.findByUserIdOrderByTimestampAsc(userId);

        // Conversation Memory context variables
        String activeLocation = "goa"; // default fallback
        Integer activeBudget = 1000;
        String travelStyle = "standard";

        for (ChatHistory chat : history) {
            String text = chat.getMessage().toLowerCase();
            if (text.contains("ravulapalem")) {
                activeLocation = "ravulapalem";
            } else if (text.contains("goa")) {
                activeLocation = "goa";
            }

            // Memory: Parse budget constraints
            if (text.contains("budget")) {
                String[] parts = text.split("\\s+");
                for (int i = 0; i < parts.length; i++) {
                    if (parts[i].contains("budget") && i + 1 < parts.length) {
                        try {
                            String numOnly = parts[i + 1].replaceAll("[^0-9]", "");
                            if (!numOnly.isEmpty()) {
                                activeBudget = Integer.parseInt(numOnly);
                            }
                        } catch (NumberFormatException ignored) {}
                    }
                }
            }

            // Memory: Parse preference tags
            if (text.contains("relax") || text.contains("coastal")) {
                travelStyle = "relaxing";
            } else if (text.contains("adventure")) {
                travelStyle = "adventurous";
            }
        }

        // Overlay current user prompt parameters on top of memorized history
        String queryLower = message.toLowerCase();
        if (queryLower.contains("ravulapalem")) {
            activeLocation = "ravulapalem";
        } else if (queryLower.contains("goa")) {
            activeLocation = "goa";
        }

        if (queryLower.contains("budget")) {
            String[] parts = queryLower.split("\\s+");
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].contains("budget") && i + 1 < parts.length) {
                    try {
                        String numOnly = parts[i + 1].replaceAll("[^0-9]", "");
                        if (!numOnly.isEmpty()) {
                            activeBudget = Integer.parseInt(numOnly);
                        }
                    } catch (NumberFormatException ignored) {}
                }
            }
        }

        // Save User Message to database
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

        // Process message utilizing conversation memory state
        if (activeLocation.equals("ravulapalem")) {
            
            // Check if user is specifically asking for malls, theatres/cinemas or just general dining
            if (queryLower.contains("mall") || queryLower.contains("shop")) {
                responseText = "I remember you are planning in Ravulapalem. Here are the top shopping hubs nearby:";
                recommendations.add(RecommendationCard.builder()
                        .id(203L)
                        .title("Caculo Mall & Hypermarket")
                        .description("Spacious shopping center with multi-brand showrooms, clothing outlets, and hypermarket.")
                        .category("Shopping Mall")
                        .rating(4.5)
                        .distance("12 km")
                        .imageUrl("https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=400&q=80")
                        .type("ATTRACTION")
                        .build());
            } else if (queryLower.contains("cinema") || queryLower.contains("theater") || queryLower.contains("movie") || queryLower.contains("hall")) {
                responseText = "I've pulled the movie halls closest to Ravulapalem for you:";
                recommendations.add(RecommendationCard.builder()
                        .id(204L)
                        .title("Satyasree Movie Complex Ravulapalem")
                        .description("Local multiplex cinema showing latest releases with comfortable seating.")
                        .category("Multiplex")
                        .rating(4.6)
                        .distance("1.1 km")
                        .imageUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80")
                        .type("EVENT")
                        .build());
            } else {
                // General plan or dinner in Ravulapalem
                responseText = String.format("Using your conversational location memory for Ravulapalem (budget: %d, style: %s), here is an evening itinerary for you:", activeBudget, travelStyle);

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

                // Build Ravulapalem coordinates schedule (base: 16.7490, 81.8440)
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
            }

        } else {
            // Memory points to Goa
            if (queryLower.contains("mall") || queryLower.contains("shop")) {
                responseText = "I remember you are in Goa. Here are the top shopping destinations around you:";
                recommendations.add(RecommendationCard.builder()
                        .id(301L)
                        .title("Mall de Goa (Porvorim)")
                        .description("Goa's premier lifestyle shopping mall featuring international brands and food courts.")
                        .category("Shopping Mall")
                        .rating(4.6)
                        .distance("3.4 km")
                        .imageUrl("https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=400&q=80")
                        .type("ATTRACTION")
                        .build());
            } else if (queryLower.contains("cinema") || queryLower.contains("theater") || queryLower.contains("movie") || queryLower.contains("hall")) {
                responseText = "Here are the closest cinemas in Goa:";
                recommendations.add(RecommendationCard.builder()
                        .id(302L)
                        .title("INOX Multiplex Panaji")
                        .description("Premium movie theater located by the Mandovi riverfront in Panaji.")
                        .category("Multiplex")
                        .rating(4.7)
                        .distance("4.2 km")
                        .imageUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80")
                        .type("EVENT")
                        .build());
            } else {
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

                responseText = String.format("Based on your conversation memory in Goa (budget: %d, style: %s), here is your itinerary:", activeBudget, travelStyle);

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

                proposal = ItineraryProposalDto.builder()
                        .title("Relaxing afternoon in Goa")
                        .destination("Goa, India")
                        .startDate(LocalDate.now().toString())
                        .endDate(LocalDate.now().toString())
                        .activities(activities)
                        .build();
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
