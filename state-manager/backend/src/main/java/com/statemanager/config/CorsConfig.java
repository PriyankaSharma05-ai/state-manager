package com.statemanager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("https://4hcp2n-3000.csb.app",
                                        "https://codesandbox.io"
                        )
                        .allowedMethods("*")
                        .allowedHeaders("*");
            }
        };
    }
}
