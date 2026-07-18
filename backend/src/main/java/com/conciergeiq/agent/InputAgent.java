package com.conciergeiq.agent;

import dev.langchain4j.model.chat.ChatLanguageModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class InputAgent {

    @Autowired(required = false)
    private ChatLanguageModel chatModel;

    public void execute(AgentState state) {
        state.addLog("InputAgent", "Analyzing user prompt: " + state.getUserQuery());
        
        String queryLower = state.getUserQuery().toLowerCase();
        boolean processedByAI = false;

        if (chatModel != null) {
            try {
                String prompt = String.format(
                    "Analyze this travel request: \"%s\". " +
                    "Extract: " +
                    "1. Target city name (if none mentioned, return '%s'). " +
                    "2. Budget limit (digits only, e.g. 1000. If none, return '1000'). " +
                    "Format your answer exactly like: CITY: <city>, BUDGET: <budget>", 
                    state.getUserQuery(),
                    state.getLocation()
                );
                
                String response = chatModel.generate(prompt);
                
                String extractedCity = state.getLocation();
                int extractedBudget = 1000;
                
                int cityIndex = response.indexOf("CITY:");
                int budgetIndex = response.indexOf("BUDGET:");
                
                if (cityIndex != -1 && budgetIndex != -1) {
                    extractedCity = response.substring(cityIndex + 5, budgetIndex).replace(",", "").trim().toLowerCase();
                    String budgetStr = response.substring(budgetIndex + 7).trim().replaceAll("[^0-9]", "");
                    if (!budgetStr.isEmpty()) {
                        extractedBudget = Integer.parseInt(budgetStr);
                    }
                    
                    state.setLocation(extractedCity);
                    state.setBudget(extractedBudget);
                    processedByAI = true;
                    state.addLog("InputAgent", String.format("[Gemini AI Extract] Destination: %s, Budget: ₹%d", extractedCity, extractedBudget));
                }
            } catch (Exception e) {
                state.addLog("InputAgent", "Gemini extraction failed, falling back to local rules. Error: " + e.getMessage());
            }
        }

        if (!processedByAI) {
            // Extract location
            String location = parseLocation(queryLower);
            if (location != null) {
                state.setLocation(location);
                state.addLog("InputAgent", "Extracted Target Destination: " + location);
            } else {
                // Keep pre-seeded dynamic location
                state.setLocation(state.getLocation());
                state.addLog("InputAgent", "No destination specified, defaulted to: " + state.getLocation());
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
                word.equalsIgnoreCase("rajamahendravaram") || 
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
