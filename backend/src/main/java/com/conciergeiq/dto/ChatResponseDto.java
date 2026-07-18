package com.conciergeiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponseDto {
    private String responseMessage;
    private List<RecommendationCard> recommendations;
    private ItineraryProposalDto proposedItinerary;
    private List<String> agentLogs;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecommendationCard {
        private Long id;
        private String title;
        private String description;
        private String category;
        private Double rating;
        private String distance;
        private String imageUrl;
        private String type; // 'RESTAURANT', 'HOTEL', 'EVENT', 'ATTRACTION'
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItineraryProposalDto {
        private String title;
        private String destination;
        private String startDate;
        private String endDate;
        private List<ProposedActivity> activities;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProposedActivity {
        private String time;
        private String name;
        private String type; // 'HOTEL', 'RESTAURANT', 'EVENT', 'ATTRACTION', 'LEISURE'
        private Long activityId;
        private Double lat;
        private Double lng;
    }
}
