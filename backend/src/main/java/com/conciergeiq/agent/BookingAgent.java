package com.conciergeiq.agent;

import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class BookingAgent {

    public void execute(AgentState state) {
        state.addLog("BookingAgent", "Analyzing proposed itinerary for automated bookings...");
        
        state.getActivities().forEach(act -> {
            if (act.getActivityId() != null) {
                String confirmId = "CONF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                state.getBookingConfirmationIds().add(confirmId);
                state.addLog("BookingAgent", String.format("Prepared ticket booking for '%s' (Ticket ID: %s)", 
                        act.getName(), confirmId));
            }
        });
        
        state.addLog("BookingAgent", "All reservations packaged. Awaiting final user approval edge transition.");
    }
}
