package com.statemanager.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String stateId;

    private AuditAction action;   // CREATED, UPDATED, DELETED, LOADED, COMPLETED

    private int stepFrom;
    private int stepTo;

    private Map<String, Object> changedFields;

    private String ipAddress;
    private String userAgent;

    private LocalDateTime timestamp;

    public enum AuditAction {
        CREATED, UPDATED, DELETED, LOADED, STEP_ADVANCED, COMPLETED, REVERTED
    }
}
