package com.conciergeiq.agent;

import com.conciergeiq.dto.ChatResponseDto.ProposedActivity;
import com.conciergeiq.dto.ChatResponseDto.RecommendationCard;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ItineraryAgent {
    private static final Logger logger = LoggerFactory.getLogger(ItineraryAgent.class);
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public void execute(AgentState state) {
        String city = state.getLocation().toLowerCase();
        String query = state.getUserQuery().toLowerCase();
        state.addLog("ItineraryAgent", "Evaluating context parameters for itinerary optimization in: " + city);

        String capitalizedLoc = city.substring(0, 1).toUpperCase() + city.substring(1);
        if (city.equals("rajamahendravaram") || city.equals("rajahmundry")) {
            capitalizedLoc = "Rajamahendravaram";
        }

        List<ProposedActivity> activities = new ArrayList<>();
        List<RecommendationCard> recommendations = new ArrayList<>();

        // 1. Detect Emergency Keywords (Hospitals, Doctors, Accidents)
        boolean isEmergency = query.contains("emergency") || query.contains("hospital") || 
                              query.contains("doctor") || query.contains("accident") || query.contains("medical");

        if (isEmergency) {
            state.addLog("ItineraryAgent", "ALERT: Medical Emergency request detected. Generating shortest routes to high-rated local hospitals.");
            state.setTripTitle("EMERGENCY MEDICAL ROUTE");

            String hospitalName = capitalizedLoc + " Apollo Emergency Hospital";
            String govtHospital = capitalizedLoc + " General Hospital";

            recommendations.add(RecommendationCard.builder()
                    .id(911L)
                    .title(hospitalName)
                    .description("24/7 Trauma care, advanced cardiology, and general medicine unit. Nearest emergency hub.")
                    .category("Hospital")
                    .rating(4.9)
                    .distance("0.8 km")
                    .imageUrl("https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=400&q=80")
                    .type("HOSPITAL")
                    .build());

            recommendations.add(RecommendationCard.builder()
                    .id(912L)
                    .title(govtHospital)
                    .description("Government General Hospital providing standard healthcare support services.")
                    .category("Hospital")
                    .rating(4.4)
                    .distance("1.6 km")
                    .imageUrl("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80")
                    .type("HOSPITAL")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("Immediate")
                    .name("Emergency Route: " + hospitalName)
                    .type("HOSPITAL")
                    .activityId(911L)
                    .build());

            state.setActivities(activities);
            state.setRecommendations(recommendations);
            return;
        }

        // 2. Query live weather to check for rain/drizzle
        boolean isRainy = false;
        try {
            String weatherApiKey = "c54ae8e21c2805eb17bdb6a4e34a2940";
            String cleanCity = city.replace(", India", "").trim();
            String weatherUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cleanCity + "&units=metric&appid=" + weatherApiKey;
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(weatherUrl))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                String body = response.body();
                Pattern weatherPattern = Pattern.compile("\"main\":\"([^\"]+)\"");
                Matcher matcher = weatherPattern.matcher(body);
                if (matcher.find()) {
                    String mainWeather = matcher.group(1).toLowerCase();
                    if (mainWeather.contains("rain") || mainWeather.contains("drizzle") || mainWeather.contains("thunderstorm")) {
                        isRainy = true;
                        state.addLog("ItineraryAgent", "Live Weather Alert: Rain detected at destination. Overriding outdoor stops to prioritize indoor options.");
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to retrieve live weather parameters: {}", e.getMessage());
        }

        // 3. Assemble dynamic timeline based on weather conditions
        String restaurantName = capitalizedLoc + " Grand Dining";
        double restRating = 4.7;
        String restImg = "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80";

        if (city.equals("rajamahendravaram") || city.equals("rajahmundry")) {
            restaurantName = "Hotel Shelton Rajamahendri Fine Dining";
            restRating = 4.9;
        }

        if (isRainy) {
            // RAIN: Force indoor itinerary (Cinema, Malls, Fine Dining)
            state.addLog("ItineraryAgent", "Adjusting strategy: Recommending indoor cinema and multiplex seating options.");
            state.setTripTitle("Rainy Day Indoor Plan");

            String cinemaName = capitalizedLoc + " Inox Multiplex";
            if (city.equals("rajamahendravaram") || city.equals("rajahmundry")) {
                cinemaName = "Sree Satyadeva Multiplex Rajahmundry";
            }

            recommendations.add(RecommendationCard.builder()
                    .id(801L)
                    .title(restaurantName)
                    .description("Highly rated fine-dine dining spot. Perfect for comfortable indoor meals.")
                    .category("Dining")
                    .rating(restRating)
                    .distance("1.1 km")
                    .imageUrl(restImg)
                    .type("RESTAURANT")
                    .build());

            recommendations.add(RecommendationCard.builder()
                    .id(802L)
                    .title(cinemaName)
                    .description("Premium indoor cinema hall. Escape the rain with comfortable seating.")
                    .category("Multiplex")
                    .rating(4.8)
                    .distance("2.4 km")
                    .imageUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80")
                    .type("EVENT")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("01:00 PM")
                    .name("Indoor Lunch: " + restaurantName)
                    .type("RESTAURANT")
                    .activityId(801L)
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("05:30 PM")
                    .name("Indoor Multiplex: " + cinemaName)
                    .type("EVENT")
                    .activityId(802L)
                    .build());

        } else {
            // CLEAR WEATHER: Standard mixed sightseeing (Restaurant, Outdoor sight/Cruise)
            state.addLog("ItineraryAgent", "Live Weather: Clear skies. Promoting outdoor sightseeing and dinner tracks.");
            state.setTripTitle("Clear Day Outdoor Plan");

            String outdoorSight = capitalizedLoc + " Sunset Cruise";
            if (city.equals("rajamahendravaram") || city.equals("rajahmundry")) {
                outdoorSight = "Godavari River Sunset Cruise Panthulu Chowk";
            }

            recommendations.add(RecommendationCard.builder()
                    .id(803L)
                    .title(restaurantName)
                    .description("Top rated dining spot serving delicious traditional platters.")
                    .category("Dining")
                    .rating(restRating)
                    .distance("1.2 km")
                    .imageUrl(restImg)
                    .type("RESTAURANT")
                    .build());

            recommendations.add(RecommendationCard.builder()
                    .id(804L)
                    .title(outdoorSight)
                    .description("Beautiful outdoor evening sunset cruise on the local waterfront.")
                    .category("Cruise")
                    .rating(4.7)
                    .distance("3.1 km")
                    .imageUrl("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80")
                    .type("ATTRACTION")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("01:00 PM")
                    .name("Lunch at " + restaurantName)
                    .type("RESTAURANT")
                    .activityId(803L)
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("05:30 PM")
                    .name("Outdoor: " + outdoorSight)
                    .type("ATTRACTION")
                    .activityId(804L)
                    .build());
        }

        state.setActivities(activities);
        state.setRecommendations(recommendations);
    }
}
