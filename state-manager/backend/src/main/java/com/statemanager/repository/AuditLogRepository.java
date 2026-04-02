package com.statemanager.repository;

import com.statemanager.model.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
    List<AuditLog> findByStateIdOrderByTimestampDesc(String stateId);
    List<AuditLog> findByUserIdOrderByTimestampDesc(String userId);
}
