package com.conciergeiq.agent;

import com.conciergeiq.dto.ChatResponseDto.ProposedActivity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MapAgent {

    public void execute(AgentState state) {
        state.addLog("MapAgent", "Mapping GPS coordinates for timeline activities...");

        double baseLat = 15.5562;
        double baseLng = 73.7512;

        String loc = state.getLocation().toLowerCase();
        if (loc.equals("ravulapalem")) {
            baseLat = 16.7490;
            baseLng = 81.8440;
        } else if (loc.equals("rajahmundry")) {
            baseLat = 17.0005;
            baseLng = 81.8040;
        } else if (loc.equals("vizag") || loc.equals("visakhapatnam")) {
            baseLat = 17.6868;
            baseLng = 83.2185;
        } else if (loc.equals("hyderabad")) {
            baseLat = 17.3850;
            baseLng = 78.4867;
        } else if (loc.equals("bangalore") || loc.equals("bengaluru")) {
            baseLat = 12.9716;
            baseLng = 77.5946;
        } else {
            int hash = Math.abs(loc.hashCode());
            baseLat = 13.0 + (hash % 1000) / 100.0;
            baseLng = 75.0 + (hash % 1000) / 100.0;
        }

        List<ProposedActivity> acts = state.getActivities();
        for (int i = 0; i < acts.size(); i++) {
            ProposedActivity act = acts.get(i);
            // Offset coordinates slightly so they don't overlay on the exact same spot
            double offsetLat = (i * 0.006) - 0.003;
            double offsetLng = (i * 0.008) - 0.004;
            
            act.setLat(baseLat + offsetLat);
            act.setLng(baseLng + offsetLng);
            
            state.addLog("MapAgent", String.format("Mapped Stop '%s' to GPS [%.4f, %.4f]", 
                    act.getName(), act.getLat(), act.getLng()));
        }

        // Set user live location base to calculate route legs
        state.setUserLat(baseLat - 0.012);
        state.setUserLng(baseLng - 0.015);
        state.addLog("MapAgent", String.format("Set route origin at Live User Coords [%.4f, %.4f]", 
                state.getUserLat(), state.getUserLng()));
    }
}
