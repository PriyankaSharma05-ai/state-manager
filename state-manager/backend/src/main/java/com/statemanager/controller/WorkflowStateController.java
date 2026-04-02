package com.statemanager.controller;

import com.statemanager.dto.StateDTO;
import com.statemanager.service.WorkflowStateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/states")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Workflow States", description = "CRUD operations for serialized workflow states")
public class WorkflowStateController {

    private final WorkflowStateService service;

    // ─── Dashboard ────────────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard stats + recent states")
    public ResponseEntity<StateDTO.DashboardStats> dashboard(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(service.getDashboard(user.getUsername()));
    }

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Create (save) a new workflow state")
    public ResponseEntity<StateDTO.Response> create(
        @AuthenticationPrincipal UserDetails user,
        @Valid @RequestBody StateDTO.CreateRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createState(user.getUsername(), req));
    }

    @GetMapping
    @Operation(summary = "List all states for the authenticated user")
    public ResponseEntity<List<StateDTO.Response>> list(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(service.getAllStates(user.getUsername()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Load a specific state by ID")
    public ResponseEntity<StateDTO.Response> get(
        @PathVariable String id,
        @AuthenticationPrincipal UserDetails user
    ) {
        return ResponseEntity.ok(service.getState(id, user.getUsername()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update state (advance step, save step data)")
    public ResponseEntity<StateDTO.Response> update(
        @PathVariable String id,
        @AuthenticationPrincipal UserDetails user,
        @Valid @RequestBody StateDTO.UpdateRequest req
    ) {
        return ResponseEntity.ok(service.updateState(id, user.getUsername(), req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a state")
    public ResponseEntity<Void> delete(
        @PathVariable String id,
        @AuthenticationPrincipal UserDetails user
    ) {
        service.deleteState(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    // ─── Extra Actions ────────────────────────────────────────────────────────

    @PatchMapping("/{id}/abandon")
    @Operation(summary = "Mark a workflow state as abandoned")
    public ResponseEntity<StateDTO.Response> abandon(
        @PathVariable String id,
        @AuthenticationPrincipal UserDetails user
    ) {
        return ResponseEntity.ok(service.abandonState(id, user.getUsername()));
    }

    @PatchMapping("/{id}/revert/{version}")
    @Operation(summary = "Revert state to a previous snapshot version")
    public ResponseEntity<StateDTO.Response> revert(
        @PathVariable String id,
        @PathVariable int version,
        @AuthenticationPrincipal UserDetails user
    ) {
        return ResponseEntity.ok(service.revertToSnapshot(id, user.getUsername(), version));
    }

    // ─── Audit Log ────────────────────────────────────────────────────────────

    @GetMapping("/{id}/audit")
    @Operation(summary = "Get audit log for a specific state")
    public ResponseEntity<List<StateDTO.AuditEntry>> audit(
        @PathVariable String id,
        @AuthenticationPrincipal UserDetails user
    ) {
        return ResponseEntity.ok(service.getAuditLog(id, user.getUsername()));
    }
}
