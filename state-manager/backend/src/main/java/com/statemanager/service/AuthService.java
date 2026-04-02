package com.statemanager.service;

import com.statemanager.dto.AuthDTOs;
import com.statemanager.model.User;
import com.statemanager.repository.UserRepository;
import com.statemanager.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;

    public AuthDTOs.AuthResponse register(AuthDTOs.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new RuntimeException("Username already taken");
        if (userRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email already registered");

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .roles(Set.of("ROLE_USER"))
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        userRepository.save(user);

        UserDetails details = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtils.generateToken(details);
        return new AuthDTOs.AuthResponse(token, user.getId(), user.getUsername(), user.getEmail());
    }

    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        UserDetails details = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtils.generateToken(details);
        return new AuthDTOs.AuthResponse(token, user.getId(), user.getUsername(), user.getEmail());
    }
}
