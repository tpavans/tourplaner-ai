package com.conciergeiq.agent;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AgentOrchestrator {

    @Autowired
    private InputAgent inputAgent;

    @Autowired
    private PlannerAgent plannerAgent;

    @Autowired
    private ItineraryAgent itineraryAgent;

    @Autowired
    private MapAgent mapAgent;

    @Autowired
    private BookingAgent bookingAgent;

    public AgentState runWorkflow(String query, Long userId) {
        AgentState state = AgentState.builder()
                .userQuery(query)
                .userId(userId)
                .build();

        state.addLog("Orchestrator", "Initializing multi-agent cooperative pipeline...");

        // Edge 1: Input Agent Node
        inputAgent.execute(state);

        // Edge 2: Planner Agent Node
        plannerAgent.execute(state);

        // Edge 3: Itinerary Agent Node
        itineraryAgent.execute(state);

        // Edge 4: Map Agent Node
        mapAgent.execute(state);

        // Edge 5: Booking Agent Node
        bookingAgent.execute(state);

        state.addLog("Orchestrator", "Multi-agent cooperative pipeline completed successfully.");
        return state;
    }
}
