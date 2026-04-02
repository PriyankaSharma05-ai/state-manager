package com.statemanager.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "workflow_states")
public class WorkflowState {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String workflowName;
    private String workflowType;   // e.g. REGISTRATION, SURVEY, ONBOARDING

    private int currentStep;
    private int totalSteps;

    private StateStatus status;    // IN_PROGRESS, COMPLETED, ABANDONED

    // Serialized step data as a flexible map
    private Map<String, Object> stateData;

    private int version;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;

    // Versioning snapshots
    private List<StateSnapshot> snapshots;

    public enum StateStatus {
        IN_PROGRESS, COMPLETED, ABANDONED
    }
}
