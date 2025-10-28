package com.pledge.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

	@Bean
	public CorsFilter corsFilter() {
		CorsConfiguration config = new CorsConfiguration();

		// ✅ Allow local dev + same-network access from any IP
		config.setAllowedOriginPatterns(List.of(
				"http://localhost:*",
				"http://127.0.0.1:*",
				"http://192.168.*.*:*",    // Allow 192.168.x.x (most common local IP range)
				"http://10.*.*.*:*",        // Allow 10.x.x.x
				"http://172.16.*.*:*",      // Allow 172.16.x.x
				"http://*.*.*.*:*"          // Allow any IP for mobile testing
		));

		config.setAllowCredentials(true);

		config.setAllowedHeaders(List.of(
				"Origin",
				"Content-Type",
				"Accept",
				"Authorization"
		));

		config.setAllowedMethods(List.of(
				"GET",
				"POST",
				"PUT",
				"DELETE",
				"OPTIONS"
		));

		config.setExposedHeaders(List.of("Authorization"));

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);

		return new CorsFilter(source);
	}
}
