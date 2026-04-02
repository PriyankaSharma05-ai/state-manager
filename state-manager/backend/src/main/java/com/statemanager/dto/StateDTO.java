package com.statemanager.dto;

import com.statemanager.model.AuditLog;
import com.statemanager.model.StateSnapshot;
import com.statemanager.model.WorkflowState;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class StateDTO {

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {
        @NotBlank private String workflowName;
        @NotBlank private String workflowType;
        @NotNull  private Integer totalSteps;
        private Map<String, Object> initialData;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateRequest {
        @NotNull private Integer currentStep;
        @NotNull private Map<String, Object> stateData;
        @Builder.Default private boolean createSnapshot = false;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private String id;
        private String userId;
        private String workflowName;
        private String workflowType;
        private int currentStep;
        private int totalSteps;
        private int progressPercent;
        private WorkflowState.StateStatus status;
        private Map<String, Object> stateData;
        private int version;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<StateSnapshot> snapshots;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DashboardStats {
        private long totalStates;
        private long inProgress;
        private long completed;
        private long abandoned;
        private List<Response> recentStates;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuditEntry {
        private String id;
        private AuditLog.AuditAction action;
        private int stepFrom;
        private int stepTo;
        private Map<String, Object> changedFields;
        private LocalDateTime timestamp;
    }
}
