package com.conciergeiq.agent;

import org.springframework.stereotype.Component;

@Component
public class PlannerAgent {

    public void execute(AgentState state) {
        state.addLog("PlannerAgent", "Starting strategy planning node...");
        
        String queryLower = state.getUserQuery().toLowerCase();
        
        // Decide what components to request from Itinerary and Map agents
        if (queryLower.contains("movie") || queryLower.contains("theatre") || queryLower.contains("cinema")) {
            state.addLog("PlannerAgent", "Strategy: Cinema event mapping requested. Delegating movie timeline mapping to Itinerary Agent.");
            state.setTripTitle("Cinema Evening Plan");
        } else if (queryLower.contains("mall") || queryLower.contains("shop")) {
            state.addLog("PlannerAgent", "Strategy: Retail shopping spots mapping requested. Routing to Itinerary Agent for retail stops.");
            state.setTripTitle("Shopping Day Plan");
        } else {
            state.addLog("PlannerAgent", "Strategy: Leisure Dining plan requested. Preparing dinner and sightseeing activities delegation.");
            state.setTripTitle("Leisure Dining Plan");
        }
    }
}
