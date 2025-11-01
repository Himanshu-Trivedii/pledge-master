package com.pledge.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // ✅ Allowed frontend origins
        config.setAllowedOriginPatterns(Arrays.asList(
                "https://www.godejewellers.in",
                "https://godejewellers.in",
                "https://pledge-master.vercel.app",
                "http://localhost:3000"
        ));

        // ✅ Allow credentials (for cookies or tokens)
        config.setAllowCredentials(true);

        // ✅ Allow all headers and methods
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        // ✅ Expose key headers
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Content-Disposition");

        // ✅ Apply to all routes
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
