package com.conciergeiq.agent;

import com.conciergeiq.dto.ChatResponseDto.ProposedActivity;
import com.conciergeiq.dto.ChatResponseDto.RecommendationCard;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ItineraryAgent {

    public void execute(AgentState state) {
        state.addLog("ItineraryAgent", "Building time-to-time schedule details for destination: " + state.getLocation());

        String capitalizedLoc = state.getLocation().substring(0, 1).toUpperCase() + state.getLocation().substring(1);
        List<ProposedActivity> activities = new ArrayList<>();
        List<RecommendationCard> recommendations = new ArrayList<>();

        String queryLower = state.getUserQuery().toLowerCase();

        if (queryLower.contains("movie") || queryLower.contains("theatre") || queryLower.contains("cinema")) {
            // Cinema timeline
            recommendations.add(RecommendationCard.builder()
                    .id(601L)
                    .title(capitalizedLoc + " Multiplex Cinema")
                    .description("Premium theater complex with comfortable seating and snack bars.")
                    .category("Multiplex")
                    .rating(4.7)
                    .distance("1.5 km")
                    .imageUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80")
                    .type("EVENT")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("06:15 PM")
                    .name("Arrive at " + capitalizedLoc + " Multiplex Cinema")
                    .type("EVENT")
                    .activityId(601L)
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("06:30 PM")
                    .name("Watch Blockbuster Movie Show")
                    .type("EVENT")
                    .build());

        } else if (queryLower.contains("mall") || queryLower.contains("shop")) {
            // Retail timeline
            recommendations.add(RecommendationCard.builder()
                    .id(602L)
                    .title(capitalizedLoc + " Lifestyle Mall")
                    .description("The best retail shopping center with multi-brand outlets.")
                    .category("Shopping")
                    .rating(4.5)
                    .distance("2.3 km")
                    .imageUrl("https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=400&q=80")
                    .type("ATTRACTION")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("04:00 PM")
                    .name("Retail Shopping at " + capitalizedLoc + " Lifestyle Mall")
                    .type("ATTRACTION")
                    .activityId(602L)
                    .build());

        } else {
            // Leisure dining timeline
            recommendations.add(RecommendationCard.builder()
                    .id(603L)
                    .title(capitalizedLoc + " Paradise Dining")
                    .description("Top rated dining spot serving delicious traditional platters.")
                    .category("Dining")
                    .rating(4.8)
                    .distance("0.9 km")
                    .imageUrl("https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80")
                    .type("RESTAURANT")
                    .build());

            recommendations.add(RecommendationCard.builder()
                    .id(604L)
                    .title(capitalizedLoc + " Lakeview Gardens")
                    .description("Scenic garden tracks for walking and sunset photography.")
                    .category("Leisure")
                    .rating(4.6)
                    .distance("2.1 km")
                    .imageUrl("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80")
                    .type("ATTRACTION")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("07:30 PM")
                    .name("Dinner at " + capitalizedLoc + " Paradise Dining")
                    .type("RESTAURANT")
                    .activityId(603L)
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("09:00 PM")
                    .name("Leisure Walk at " + capitalizedLoc + " Lakeview Gardens")
                    .type("ATTRACTION")
                    .activityId(604L)
                    .build());
        }

        state.setActivities(activities);
        state.setRecommendations(recommendations);
        state.addLog("ItineraryAgent", "Successfully constructed " + activities.size() + " timeline steps for the itinerary.");
    }
}
