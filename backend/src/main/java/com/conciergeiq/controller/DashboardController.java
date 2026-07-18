package com.conciergeiq.controller;

import com.conciergeiq.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        return ResponseEntity.ok(analyticsService.getAdminStats());
    }

    @GetMapping("/staff")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStaffDashboard(@RequestParam(defaultValue = "1") Long hotelId) {
        return ResponseEntity.ok(analyticsService.getStaffStats(hotelId));
    }
}
