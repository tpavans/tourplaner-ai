package com.conciergeiq.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String refreshToken;
    private Long id;
    private String email;
    private String fullName;
    private String role;

    public JwtResponse(String token, String refreshToken, Long id, String email, String fullName, String role) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }
}
