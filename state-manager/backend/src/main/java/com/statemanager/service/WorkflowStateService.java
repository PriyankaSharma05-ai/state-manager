package com.statemanager.service;

import com.statemanager.dto.StateDTO;
import com.statemanager.model.*;
import com.statemanager.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowStateService {

    private final WorkflowStateRepository stateRepo;
    private final UserRepository userRepo;
    private final AuditLogRepository auditRepo;

    // ─── Create ───────────────────────────────────────────────────────────────

    public StateDTO.Response createState(String username, StateDTO.CreateRequest req) {
        User user = getUser(username);

        WorkflowState state = WorkflowState.builder()
            .userId(user.getId())
            .workflowName(req.getWorkflowName())
            .workflowType(req.getWorkflowType())
            .currentStep(1)
            .totalSteps(req.getTotalSteps())
            .status(WorkflowState.StateStatus.IN_PROGRESS)
            .stateData(req.getInitialData() != null ? req.getInitialData() : new HashMap<>())
            .version(1)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .snapshots(new ArrayList<>())
            .build();

        stateRepo.save(state);
        audit(state, user.getId(), AuditLog.AuditAction.CREATED, 0, 1, null);
        log.info("Created workflow state {} for user {}", state.getId(), username);
        return toResponse(state);
    }

    // ─── Read ────────────────────────────────────────────────────────────────

    public StateDTO.Response getState(String stateId, String username) {
        User user = getUser(username);
        WorkflowState state = stateRepo.findByIdAndUserId(stateId, user.getId())
            .orElseThrow(() -> new RuntimeException("State not found"));
        audit(state, user.getId(), AuditLog.AuditAction.LOADED, state.getCurrentStep(), state.getCurrentStep(), null);
        return toResponse(state);
    }

    public List<StateDTO.Response> getAllStates(String username) {
        User user = getUser(username);
        return stateRepo.findByUserId(user.getId()).stream().map(this::toResponse).toList();
    }

    public StateDTO.DashboardStats getDashboard(String username) {
        User user = getUser(username);
        List<WorkflowState> all = stateRepo.findByUserId(user.getId());
        long inProgress = all.stream().filter(s -> s.getStatus() == WorkflowState.StateStatus.IN_PROGRESS).count();
        long completed  = all.stream().filter(s -> s.getStatus() == WorkflowState.StateStatus.COMPLETED).count();
        long abandoned  = all.stream().filter(s -> s.getStatus() == WorkflowState.StateStatus.ABANDONED).count();

        List<StateDTO.Response> recent = all.stream()
            .sorted(Comparator.comparing(WorkflowState::getUpdatedAt).reversed())
            .limit(5)
            .map(this::toResponse)
            .toList();

        return StateDTO.DashboardStats.builder()
            .totalStates(all.size())
            .inProgress(inProgress)
            .completed(completed)
            .abandoned(abandoned)
            .recentStates(recent)
            .build();
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    public StateDTO.Response updateState(String stateId, String username, StateDTO.UpdateRequest req) {
        User user = getUser(username);
        WorkflowState state = stateRepo.findByIdAndUserId(stateId, user.getId())
            .orElseThrow(() -> new RuntimeException("State not found"));

        int prevStep = state.getCurrentStep();

        // Optional snapshot before updating
        if (req.isCreateSnapshot()) {
            StateSnapshot snap = StateSnapshot.builder()
                .version(state.getVersion())
                .step(state.getCurrentStep())
                .stateData(new HashMap<>(state.getStateData()))
                .savedAt(LocalDateTime.now())
                .savedBy(user.getId())
                .build();
            state.getSnapshots().add(snap);
        }

        // Merge new data into existing state data
        Map<String, Object> merged = new HashMap<>(state.getStateData());
        merged.putAll(req.getStateData());
        state.setStateData(merged);
        state.setCurrentStep(req.getCurrentStep());
        state.setVersion(state.getVersion() + 1);
        state.setUpdatedAt(LocalDateTime.now());

        // Auto-complete if last step reached
        if (req.getCurrentStep() >= state.getTotalSteps()) {
            state.setStatus(WorkflowState.StateStatus.COMPLETED);
            state.setCompletedAt(LocalDateTime.now());
            audit(state, user.getId(), AuditLog.AuditAction.COMPLETED, prevStep, req.getCurrentStep(), req.getStateData());
        } else {
            audit(state, user.getId(), AuditLog.AuditAction.STEP_ADVANCED, prevStep, req.getCurrentStep(), req.getStateData());
        }

        stateRepo.save(state);
        return toResponse(state);
    }

    // ─── Delete ───────────────────────────────────────────────────────────────

    public void deleteState(String stateId, String username) {
        User user = getUser(username);
        WorkflowState state = stateRepo.findByIdAndUserId(stateId, user.getId())
            .orElseThrow(() -> new RuntimeException("State not found"));
        audit(state, user.getId(), AuditLog.AuditAction.DELETED, state.getCurrentStep(), 0, null);
        stateRepo.delete(state);
        log.info("Deleted state {} for user {}", stateId, username);
    }

    // ─── Abandon ──────────────────────────────────────────────────────────────

    public StateDTO.Response abandonState(String stateId, String username) {
        User user = getUser(username);
        WorkflowState state = stateRepo.findByIdAndUserId(stateId, user.getId())
            .orElseThrow(() -> new RuntimeException("State not found"));
        state.setStatus(WorkflowState.StateStatus.ABANDONED);
        state.setUpdatedAt(LocalDateTime.now());
        stateRepo.save(state);
        audit(state, user.getId(), AuditLog.AuditAction.UPDATED, state.getCurrentStep(), state.getCurrentStep(), null);
        return toResponse(state);
    }

    // ─── Revert to Snapshot ───────────────────────────────────────────────────

    public StateDTO.Response revertToSnapshot(String stateId, String username, int version) {
        User user = getUser(username);
        WorkflowState state = stateRepo.findByIdAndUserId(stateId, user.getId())
            .orElseThrow(() -> new RuntimeException("State not found"));

        StateSnapshot snap = state.getSnapshots().stream()
            .filter(s -> s.getVersion() == version)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Snapshot version " + version + " not found"));

        int prevStep = state.getCurrentStep();
        state.setStateData(new HashMap<>(snap.getStateData()));
        state.setCurrentStep(snap.getStep());
        state.setStatus(WorkflowState.StateStatus.IN_PROGRESS);
        state.setVersion(state.getVersion() + 1);
        state.setUpdatedAt(LocalDateTime.now());
        stateRepo.save(state);

        audit(state, user.getId(), AuditLog.AuditAction.REVERTED, prevStep, snap.getStep(), null);
        return toResponse(state);
    }

    // ─── Audit Log ────────────────────────────────────────────────────────────

    public List<StateDTO.AuditEntry> getAuditLog(String stateId, String username) {
        User user = getUser(username);
        stateRepo.findByIdAndUserId(stateId, user.getId())
            .orElseThrow(() -> new RuntimeException("State not found"));
        return auditRepo.findByStateIdOrderByTimestampDesc(stateId).stream()
            .map(a -> StateDTO.AuditEntry.builder()
                .id(a.getId())
                .action(a.getAction())
                .stepFrom(a.getStepFrom())
                .stepTo(a.getStepTo())
                .changedFields(a.getChangedFields())
                .timestamp(a.getTimestamp())
                .build())
            .toList();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private User getUser(String username) {
        return userRepo.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private void audit(WorkflowState state, String userId, AuditLog.AuditAction action,
                       int from, int to, Map<String, Object> changed) {
        AuditLog log = AuditLog.builder()
            .userId(userId)
            .stateId(state.getId())
            .action(action)
            .stepFrom(from)
            .stepTo(to)
            .changedFields(changed)
            .timestamp(LocalDateTime.now())
            .build();
        auditRepo.save(log);
    }

    private StateDTO.Response toResponse(WorkflowState s) {
        int pct = s.getTotalSteps() > 0
            ? (int) Math.round((double)(s.getCurrentStep() - 1) / s.getTotalSteps() * 100)
            : 0;
        if (s.getStatus() == WorkflowState.StateStatus.COMPLETED) pct = 100;

        return StateDTO.Response.builder()
            .id(s.getId())
            .userId(s.getUserId())
            .workflowName(s.getWorkflowName())
            .workflowType(s.getWorkflowType())
            .currentStep(s.getCurrentStep())
            .totalSteps(s.getTotalSteps())
            .progressPercent(pct)
            .status(s.getStatus())
            .stateData(s.getStateData())
            .version(s.getVersion())
            .createdAt(s.getCreatedAt())
            .updatedAt(s.getUpdatedAt())
            .snapshots(s.getSnapshots())
            .build();
    }
}
