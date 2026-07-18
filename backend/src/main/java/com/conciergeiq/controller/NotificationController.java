package com.conciergeiq.controller;

import com.conciergeiq.dto.MessageResponse;
import com.conciergeiq.entity.Notification;
import com.conciergeiq.security.UserDetailsImpl;
import com.conciergeiq.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    private Long getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getNotificationsByUser(getCurrentUserId()));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications() {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsByUser(getCurrentUserId()));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<MessageResponse> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId, getCurrentUserId());
        return ResponseEntity.ok(new MessageResponse("Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<MessageResponse> markAllAsRead() {
        notificationService.markAllAsRead(getCurrentUserId());
        return ResponseEntity.ok(new MessageResponse("All notifications marked as read"));
    }
}
