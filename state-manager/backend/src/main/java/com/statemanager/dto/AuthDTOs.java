package com.statemanager.dto;

import com.statemanager.model.WorkflowState;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// ─── Auth DTOs ────────────────────────────────────────────────────────────────


public class AuthDTOs {

    @Data
    public static class RegisterRequest {
        @NotBlank private String username;
        @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data
    public static class LoginRequest {
        @NotBlank private String username;
        @NotBlank private String password;
    }

    @Data
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String userId;
        private String username;
        private String email;
    }
}

// ─── State DTOs ───────────────────────────────────────────────────────────────

class StateDTOs {}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class CreateStateRequest {
    @NotBlank private String workflowName;
    @NotBlank private String workflowType;
    @NotNull  private Integer totalSteps;
    private Map<String, Object> initialData;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class UpdateStateRequest {
    @NotNull private Integer currentStep;
    @NotNull private Map<String, Object> stateData;
    private boolean createSnapshot;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class StateResponse {
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
    private int snapshotCount;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class DashboardStats {
    private long totalStates;
    private long inProgress;
    private long completed;
    private long abandoned;
    private List<StateResponse> recentStates;
}
