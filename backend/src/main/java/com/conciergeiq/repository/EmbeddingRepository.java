package com.conciergeiq.repository;

import com.conciergeiq.entity.Embedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmbeddingRepository extends JpaRepository<Embedding, Long> {
    List<Embedding> findByTargetType(String targetType);
}
