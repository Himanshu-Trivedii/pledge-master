package com.pledge.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${cors.allowed.origins:http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // ✅ Support multiple origins (split by comma)
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        origins.replaceAll(String::trim); // remove spaces
        config.setAllowedOriginPatterns(origins);


        // ✅ Allow credentials (for cookies / JWT)
        config.setAllowCredentials(true);

        // ✅ Common allowed headers
        config.setAllowedHeaders(List.of(
                "Origin",
                "Content-Type",
                "Accept",
                "Authorization",
                "X-Requested-With"
        ));

        // ✅ HTTP methods allowed
        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
        ));

        // ✅ Expose headers to frontend
        config.setExposedHeaders(List.of(
                "Authorization",
                "Content-Disposition"
        ));

        // ✅ Cache CORS preflight response
        config.setMaxAge(3600L);

        // ✅ Apply to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
