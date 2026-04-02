package com.statemanager.model;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StateSnapshot {
    private int version;
    private int step;
    private Map<String, Object> stateData;
    private LocalDateTime savedAt;
    private String savedBy;   // userId or "system"
}
