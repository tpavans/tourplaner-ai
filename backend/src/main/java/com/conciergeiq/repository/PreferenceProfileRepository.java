package com.conciergeiq.repository;

import com.conciergeiq.entity.PreferenceProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PreferenceProfileRepository extends JpaRepository<PreferenceProfile, Long> {
    Optional<PreferenceProfile> findByUserId(Long userId);
}
