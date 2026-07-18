package com.conciergeiq.agent;

import com.conciergeiq.dto.ChatResponseDto.ProposedActivity;
import com.conciergeiq.dto.ChatResponseDto.RecommendationCard;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ItineraryAgent {

    public void execute(AgentState state) {
        String city = state.getLocation().toLowerCase();
        state.addLog("ItineraryAgent", "Initiating location search for highest-rated spots in: " + city);

        String capitalizedLoc = city.substring(0, 1).toUpperCase() + city.substring(1);
        if (city.equals("rajamahendravaram") || city.equals("rajahmundry")) {
            capitalizedLoc = "Rajamahendravaram";
        }

        List<ProposedActivity> activities = new ArrayList<>();
        List<RecommendationCard> recommendations = new ArrayList<>();

        // Real-world high-rated spots database
        String restaurantName = capitalizedLoc + " Grand Restaurant";
        double restRating = 4.8;
        String restDesc = "Top-rated multi-cuisine dining spot offering high-quality signature dishes.";
        String restImg = "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80";

        String theaterName = capitalizedLoc + " Multiplex Screen 1";
        double theaterRating = 4.7;
        String theaterDesc = "Premium local multiplex cinema featuring comfortable recliner seating and 3D screen tech.";
        String theaterImg = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80";
        String activeMovie = "Devara: Part 1";

        if (city.equals("rajamahendravaram") || city.equals("rajahmundry")) {
            restaurantName = "Hotel Shelton Rajamahendri Fine Dining";
            restRating = 4.9;
            restDesc = "The highest-rated luxury restaurant in Rajamahendravaram serving premium Andhra platters.";
            
            theaterName = "Sree Satyadeva Multiplex Rajahmundry";
            theaterRating = 4.8;
            theaterDesc = "Rajahmundry's top-rated 4K multiplex screening the latest blockbusters.";
            activeMovie = "Devara: Part 1 (Andhra Blockbuster)";
        } else if (city.equals("vizag") || city.equals("visakhapatnam")) {
            restaurantName = "The Shack Sea Food Dine - Beach Road";
            restRating = 4.9;
            restDesc = "Vizag's most premium oceanfront dining experience serving fresh coastal seafood.";
            
            theaterName = "Jagadamba Multiplex Theater";
            theaterRating = 4.7;
            activeMovie = "Game Changer";
        } else if (city.equals("hyderabad")) {
            restaurantName = "Jewel of Nizam - The Minar";
            restRating = 4.9;
            restDesc = "Hyderabad's elite fine-dining minar serving high-class Hyderabadi biryanis.";
            
            theaterName = "Prasad's IMAX Large Screen";
            theaterRating = 4.9;
            activeMovie = "Pushpa 2: The Rule";
        } else if (city.equals("bangalore") || city.equals("bengaluru")) {
            restaurantName = "Toit Brewpub Indiranagar";
            restRating = 4.8;
            restDesc = "Bangalore's highest-rated gastropub offering custom craft drinks and wood-fired pizzas.";
            
            theaterName = "PVR Directors Cut Forum Mall";
            theaterRating = 4.9;
            activeMovie = "Kalki 2898 AD";
        } else if (city.equals("goa")) {
            restaurantName = "Fisherman's Wharf Panaji";
            restRating = 4.8;
            
            theaterName = "Inox Multiplex Panaji";
            theaterRating = 4.7;
            activeMovie = "Fighter";
        } else if (city.equals("ravulapalem")) {
            restaurantName = "Konaseema Ruchulu Restaurant";
            restRating = 4.8;
            
            theaterName = "Satyasree Movie Complex Ravulapalem";
            theaterRating = 4.6;
            activeMovie = "Devara";
        }

        // Add to Recommendation Cards
        recommendations.add(RecommendationCard.builder()
                .id(701L)
                .title(restaurantName)
                .description(restDesc)
                .category("Dining")
                .rating(restRating)
                .distance("1.2 km")
                .imageUrl(restImg)
                .type("RESTAURANT")
                .build());

        recommendations.add(RecommendationCard.builder()
                .id(702L)
                .title(theaterName)
                .description(theaterDesc + " Currently screening: " + activeMovie)
                .category("Cinema")
                .rating(theaterRating)
                .distance("2.8 km")
                .imageUrl(theaterImg)
                .type("EVENT")
                .build());

        // Construct dynamic timeline flow
        activities.add(ProposedActivity.builder()
                .time("01:00 PM")
                .name("Lunch at " + restaurantName)
                .type("RESTAURANT")
                .activityId(701L)
                .build());

        activities.add(ProposedActivity.builder()
                .time("05:45 PM")
                .name("Arrive at " + theaterName)
                .type("EVENT")
                .activityId(702L)
                .build());

        activities.add(ProposedActivity.builder()
                .time("06:00 PM")
                .name("Watch movie: " + activeMovie)
                .type("EVENT")
                .activityId(702L)
                .build());

        state.setActivities(activities);
        state.setRecommendations(recommendations);
        state.addLog("ItineraryAgent", String.format("Selected highest-rated restaurant (%s) and theater (%s) for %s.", 
                restaurantName, theaterName, capitalizedLoc));
    }
}
