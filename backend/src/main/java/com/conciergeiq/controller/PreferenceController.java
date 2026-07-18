package com.conciergeiq.controller;

import com.conciergeiq.dto.PreferenceProfileDto;
import com.conciergeiq.entity.PreferenceProfile;
import com.conciergeiq.entity.User;
import com.conciergeiq.exception.ResourceNotFoundException;
import com.conciergeiq.repository.PreferenceProfileRepository;
import com.conciergeiq.repository.UserRepository;
import com.conciergeiq.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile/preferences")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PreferenceController {

    @Autowired
    private PreferenceProfileRepository preferenceProfileRepository;

    @Autowired
    private UserRepository userRepository;

    private Long getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public ResponseEntity<PreferenceProfileDto> getPreferences() {
        Long userId = getCurrentUserId();
        PreferenceProfile profile = preferenceProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Preferences not found for user ID: " + userId));

        PreferenceProfileDto dto = new PreferenceProfileDto(
                profile.getInterests(),
                profile.getFoodPreferences(),
                profile.getAccommodationPreferences(),
                profile.getBudgetTier(),
                profile.getMobilityLevel()
        );
        return ResponseEntity.ok(dto);
    }

    @PutMapping
    public ResponseEntity<PreferenceProfileDto> updatePreferences(@RequestBody PreferenceProfileDto dto) {
        Long userId = getCurrentUserId();
        PreferenceProfile profile = preferenceProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
                    return PreferenceProfile.builder().user(user).build();
                });

        if (dto.getInterests() != null) {
            profile.setInterests(dto.getInterests());
        }
        if (dto.getFoodPreferences() != null) {
            profile.setFoodPreferences(dto.getFoodPreferences());
        }
        if (dto.getAccommodationPreferences() != null) {
            profile.setAccommodationPreferences(dto.getAccommodationPreferences());
        }
        if (dto.getBudgetTier() != null) {
            profile.setBudgetTier(dto.getBudgetTier());
        }
        if (dto.getMobilityLevel() != null) {
            profile.setMobilityLevel(dto.getMobilityLevel());
        }

        PreferenceProfile saved = preferenceProfileRepository.save(profile);
        PreferenceProfileDto response = new PreferenceProfileDto(
                saved.getInterests(),
                saved.getFoodPreferences(),
                saved.getAccommodationPreferences(),
                saved.getBudgetTier(),
                saved.getMobilityLevel()
        );
        return ResponseEntity.ok(response);
    }
}
