package com.conciergeiq.agent;

import org.springframework.stereotype.Component;

@Component
public class InputAgent {

    public void execute(AgentState state) {
        state.addLog("InputAgent", "Analyzing user prompt: " + state.getUserQuery());
        
        String queryLower = state.getUserQuery().toLowerCase();
        
        // Extract location
        String location = parseLocation(queryLower);
        if (location != null) {
            state.setLocation(location);
            state.addLog("InputAgent", "Extracted Target Destination: " + location);
        } else {
            state.setLocation("goa"); // Default
            state.addLog("InputAgent", "No destination specified, defaulted to Goa");
        }

        // Extract budget
        Integer budget = parseBudget(queryLower);
        if (budget != null) {
            state.setBudget(budget);
            state.addLog("InputAgent", "Extracted Budget Constraint: ₹" + budget);
        } else {
            state.setBudget(1000); // Default
            state.addLog("InputAgent", "No budget limit specified, assumed default ₹1000");
        }
    }

    private String parseLocation(String message) {
        String[] words = message.split("\\s+");
        for (int i = 0; i < words.length; i++) {
            String word = words[i].replaceAll("[^a-zA-Z]", "");
            
            if ((word.equals("in") || word.equals("at") || word.equals("to")) && i + 1 < words.length) {
                String next = words[i + 1].replaceAll("[^a-zA-Z]", "");
                if (next.length() > 2) return next.toLowerCase();
            }

            if (word.equals("lo") && i - 1 >= 0) {
                String prev = words[i - 1].replaceAll("[^a-zA-Z]", "");
                if (prev.length() > 2) return prev.toLowerCase();
            }

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
}
