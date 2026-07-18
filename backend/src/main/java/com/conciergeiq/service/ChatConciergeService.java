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
    private ChatHistoryRepository chatHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    public ChatResponseDto processMessage(String message, Long userId) {
        logger.info("Processing message from user {}: {}", userId, message);

        // Retrieve conversation memory from DB history
        List<ChatHistory> history = chatHistoryRepository.findByUserIdOrderByTimestampAsc(userId);

        // 1. Scan memory to recall context
        String activeLocation = "goa"; // default
        Integer activeBudget = 1000;
        String travelStyle = "standard";

        for (ChatHistory chat : history) {
            String text = chat.getMessage().toLowerCase();
            String extractedLoc = parseLocation(text);
            if (extractedLoc != null) {
                activeLocation = extractedLoc;
            }
            Integer budget = parseBudget(text);
            if (budget != null) {
                activeBudget = budget;
            }
        }

        // 2. Parse current message requirements
        String queryLower = message.toLowerCase();
        String currentLoc = parseLocation(queryLower);
        if (currentLoc != null) {
            activeLocation = currentLoc;
        }
        Integer currentBudget = parseBudget(queryLower);
        if (currentBudget != null) {
            activeBudget = currentBudget;
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
        List<ProposedActivity> activities = new ArrayList<>();
        String responseText;

        // Base coordinates for target cities
        double baseLat = 15.5562;
        double baseLng = 73.7512;

        if (activeLocation.equalsIgnoreCase("ravulapalem")) {
            baseLat = 16.7490;
            baseLng = 81.8440;
        } else if (activeLocation.equalsIgnoreCase("rajahmundry")) {
            baseLat = 17.0005;
            baseLng = 81.8040;
        } else if (activeLocation.equalsIgnoreCase("vizag") || activeLocation.equalsIgnoreCase("visakhapatnam")) {
            baseLat = 17.6868;
            baseLng = 83.2185;
        } else if (activeLocation.equalsIgnoreCase("hyderabad")) {
            baseLat = 17.3850;
            baseLng = 78.4867;
        } else if (activeLocation.equalsIgnoreCase("bangalore") || activeLocation.equalsIgnoreCase("bengaluru")) {
            baseLat = 12.9716;
            baseLng = 77.5946;
        } else {
            // Deterministic hashing for any other custom city name to place it on a realistic landmass in India
            int hash = Math.abs(activeLocation.hashCode());
            baseLat = 13.0 + (hash % 1000) / 100.0;  // 13.0 to 23.0
            baseLng = 75.0 + (hash % 1000) / 100.0;  // 75.0 to 85.0
        }

        String capitalizedLoc = activeLocation.substring(0, 1).toUpperCase() + activeLocation.substring(1);

        // Generate dynamic recommendations based on user requirements (dinner, movies, malls, sights)
        if (queryLower.contains("movie") || queryLower.contains("theatre") || queryLower.contains("cinema") || queryLower.contains("hall")) {
            
            String cardTitle = capitalizedLoc + " Multiplex Cinema";
            String cardDesc = "Modern multiplex theater featuring comfortable seating, 3D screens, and multi-cuisine snack bars.";
            
            recommendations.add(RecommendationCard.builder()
                    .id(501L)
                    .title(cardTitle)
                    .description(cardDesc)
                    .category("Multiplex")
                    .rating(4.7)
                    .distance("1.5 km")
                    .imageUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80")
                    .type("EVENT")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("06:15 PM")
                    .name("Arrive at " + cardTitle)
                    .type("EVENT")
                    .activityId(501L)
                    .lat(baseLat + 0.005)
                    .lng(baseLng - 0.003)
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("06:30 PM")
                    .name("Watch Evening Movie Show")
                    .type("EVENT")
                    .lat(baseLat + 0.005)
                    .lng(baseLng - 0.003)
                    .build());

            responseText = String.format("Hello! I've located the top cinema complexes in %s based on your query. I have structured a movie evening plan for you within your budget of %d. Check the live Google-styled map on the right to trace the location!", capitalizedLoc, activeBudget);

        } else if (queryLower.contains("mall") || queryLower.contains("shop")) {
            
            String cardTitle = capitalizedLoc + " Town Center Mall";
            String cardDesc = "A premium shopping destination containing international brand outlets, food courts, and entertainment zones.";

            recommendations.add(RecommendationCard.builder()
                    .id(502L)
                    .title(cardTitle)
                    .description(cardDesc)
                    .category("Shopping")
                    .rating(4.6)
                    .distance("2.1 km")
                    .imageUrl("https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=400&q=80")
                    .type("ATTRACTION")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("04:00 PM")
                    .name("Shopping at " + cardTitle)
                    .type("ATTRACTION")
                    .activityId(502L)
                    .lat(baseLat - 0.008)
                    .lng(baseLng + 0.006)
                    .build());

            responseText = String.format("Sure! I have found the best shopping spots in %s. Here is your shopping itinerary details for today:", capitalizedLoc);

        } else {
            // General Plan / Dinner / Lunch
            String restaurantName = capitalizedLoc + " Paradise Restaurant";
            String sightName = capitalizedLoc + " Promenade & Park";

            recommendations.add(RecommendationCard.builder()
                    .id(503L)
                    .title(restaurantName)
                    .description("Highly rated fine-dining restaurant serving authentic local cuisines and signature dishes.")
                    .category("Local Dining")
                    .rating(4.8)
                    .distance("0.8 km")
                    .imageUrl("https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80")
                    .type("RESTAURANT")
                    .build());

            recommendations.add(RecommendationCard.builder()
                    .id(504L)
                    .title(sightName)
                    .description("Lush green gardens and walking tracks, perfect for a relaxing evening stroll.")
                    .category("Sights")
                    .rating(4.5)
                    .distance("1.9 km")
                    .imageUrl("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80")
                    .type("ATTRACTION")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("07:30 PM")
                    .name("Dinner at " + restaurantName)
                    .type("RESTAURANT")
                    .activityId(503L)
                    .lat(baseLat)
                    .lng(baseLng)
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("09:00 PM")
                    .name("Leisure Walk at " + sightName)
                    .type("ATTRACTION")
                    .activityId(504L)
                    .lat(baseLat + 0.012)
                    .lng(baseLng + 0.015)
                    .build());

            responseText = String.format("I'd be glad to help! I've designed a personalized evening plan for you in %s keeping in mind your requirements (Budget: %d). The details and route segments have been plotted on the live map:", capitalizedLoc, activeBudget);
        }

        ItineraryProposalDto proposal = ItineraryProposalDto.builder()
                .title("Custom Plan in " + capitalizedLoc)
                .destination(capitalizedLoc)
                .startDate(LocalDate.now().toString())
                .endDate(LocalDate.now().toString())
                .activities(activities)
                .build();

        // Save Response
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

    // Helper: Extract location name from query
    private String parseLocation(String message) {
        String[] words = message.split("\\s+");
        for (int i = 0; i < words.length; i++) {
            String word = words[i].replaceAll("[^a-zA-Z]", "");
            
            // Check for location indicators (in city, at city, to city)
            if ((word.equals("in") || word.equals("at") || word.equals("to")) && i + 1 < words.length) {
                String next = words[i + 1].replaceAll("[^a-zA-Z]", "");
                if (next.length() > 2) return next.toLowerCase();
            }

            // Check for Telugu location suffix "lo" (e.g. "ravulapalem lo", "vizag lo")
            if (word.equals("lo") && i - 1 >= 0) {
                String prev = words[i - 1].replaceAll("[^a-zA-Z]", "");
                if (prev.length() > 2) return prev.toLowerCase();
            }

            // Direct city keyword matches
            if (word.equalsIgnoreCase("ravulapalem") || 
                word.equalsIgnoreCase("goa") || 
                word.equalsIgnoreCase("rajahmundry") || 
                word.equalsIgnoreCase("vizag") || 
                word.equalsIgnoreCase("visakhapatnam") ||
                word.equalsIgnoreCase("hyderabad") ||
                word.equalsIgnoreCase("bangalore") ||
                word.equalsIgnoreCase("bengaluru")) {
                return word.toLowerCase();
            }
        }
        return null;
    }

    // Helper: Extract budget value from query
    private Integer parseBudget(String message) {
        if (message.contains("budget")) {
            String[] words = message.split("\\s+");
            for (int i = 0; i < words.length; i++) {
                if (words[i].contains("budget") && i + 1 < words.length) {
                    try {
                        String digits = words[i + 1].replaceAll("[^0-9]", "");
                        if (!digits.isEmpty()) {
                            return Integer.parseInt(digits);
                        }
                    } catch (NumberFormatException ignored) {}
                }
            }
        }
        return null;
    }

    public List<ChatHistory> getChatHistory(Long userId) {
        return chatHistoryRepository.findByUserIdOrderByTimestampAsc(userId);
    }
}
