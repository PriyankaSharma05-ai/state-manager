package com.statemanager.repository;

import com.statemanager.model.WorkflowState;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowStateRepository extends MongoRepository<WorkflowState, String> {
    List<WorkflowState> findByUserId(String userId);
    List<WorkflowState> findByUserIdAndStatus(String userId, WorkflowState.StateStatus status);
    Optional<WorkflowState> findByIdAndUserId(String id, String userId);
    long countByUserIdAndStatus(String userId, WorkflowState.StateStatus status);
    void deleteByIdAndUserId(String id, String userId);
}
