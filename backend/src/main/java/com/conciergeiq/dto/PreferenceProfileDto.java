package com.conciergeiq.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PreferenceProfileDto {
    private List<String> interests;
    private List<String> foodPreferences;
    private List<String> accommodationPreferences;
    private String budgetTier;
    private String mobilityLevel;
}
