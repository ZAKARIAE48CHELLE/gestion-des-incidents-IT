package com.incidents.ms2.affectation.dto;

public class ValidationResponse {
    private Long id;
    private boolean exists;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public boolean isExists() { return exists; }
    public void setExists(boolean exists) { this.exists = exists; }
}
