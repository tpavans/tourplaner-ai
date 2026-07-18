package com.conciergeiq.agent;

import com.conciergeiq.dto.ChatResponseDto.ProposedActivity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class MapAgent {
    private static final Logger logger = LoggerFactory.getLogger(MapAgent.class);
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public void execute(AgentState state) {
        state.addLog("MapAgent", "Locating target coordinates dynamically on real-world maps...");

        String city = state.getLocation().toLowerCase();
        double resolvedLat = 15.5562; // fallback Goa
        double resolvedLng = 73.7512;
        boolean geocoded = false;

        // Try geocoding city using Nominatim OpenStreetMap API
        try {
            String url = "https://nominatim.openstreetmap.org/search?q=" + city + "&format=json&limit=1";
            state.addLog("MapAgent", "Querying global map API: " + url);
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "ConciergeIQ-AgentService/1.0")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200 && !response.body().equals("[]")) {
                String body = response.body();
                
                // Parse lat and lon via simple Regex to avoid heavy JSON dependencies
                Pattern latPattern = Pattern.compile("\"lat\":\"(-?\\d+\\.\\d+)\"");
                Pattern lonPattern = Pattern.compile("\"lon\":\"(-?\\d+\\.\\d+)\"");
                
                Matcher latMatcher = latPattern.matcher(body);
                Matcher lonMatcher = lonPattern.matcher(body);
                
                if (latMatcher.find() && lonMatcher.find()) {
                    resolvedLat = Double.parseDouble(latMatcher.group(1));
                    resolvedLng = Double.parseDouble(lonMatcher.group(1));
                    geocoded = true;
                    state.addLog("MapAgent", String.format("API match found for '%s' -> GPS [%.4f, %.4f]", 
                            state.getLocation(), resolvedLat, resolvedLng));
                }
            }
        } catch (Exception e) {
            logger.warn("OSM Geocoding failed, falling back to local coordinates mapping. Error: {}", e.getMessage());
        }

        if (!geocoded) {
            state.addLog("MapAgent", "Map API rate-limited or offline. Falling back to local deterministic hash mappings.");
            // Fallback base coordinates
            if (city.equals("ravulapalem")) {
                resolvedLat = 16.7490;
                resolvedLng = 81.8440;
            } else if (city.equals("rajahmundry")) {
                resolvedLat = 17.0005;
                resolvedLng = 81.8040;
            } else if (city.equals("vizag") || city.equals("visakhapatnam")) {
                resolvedLat = 17.6868;
                resolvedLng = 83.2185;
            } else if (city.equals("hyderabad")) {
                resolvedLat = 17.3850;
                resolvedLng = 78.4867;
            } else if (city.equals("bangalore") || city.equals("bengaluru")) {
                resolvedLat = 12.9716;
                resolvedLng = 77.5946;
            } else {
                int hash = Math.abs(city.hashCode());
                resolvedLat = 13.0 + (hash % 1000) / 100.0;
                resolvedLng = 75.0 + (hash % 1000) / 100.0;
            }
        }

        List<ProposedActivity> acts = state.getActivities();
        for (int i = 0; i < acts.size(); i++) {
            ProposedActivity act = acts.get(i);
            
            // Distribute schedule pins relative to base coordinates
            double offsetLat = (i * 0.008) - 0.004;
            double offsetLng = (i * 0.010) - 0.005;
            
            act.setLat(resolvedLat + offsetLat);
            act.setLng(resolvedLng + offsetLng);
            
            state.addLog("MapAgent", String.format("Mapped Stop '%s' to GPS [%.4f, %.4f]", 
                    act.getName(), act.getLat(), act.getLng()));
        }

        // Center origin point
        state.setUserLat(resolvedLat - 0.012);
        state.setUserLng(resolvedLng - 0.015);
    }
}
