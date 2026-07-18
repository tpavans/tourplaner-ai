package com.conciergeiq.repository;

import com.conciergeiq.entity.EventTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventTicketRepository extends JpaRepository<EventTicket, Long> {
    List<EventTicket> findByUserId(Long userId);
}
