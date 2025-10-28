package com.pledge.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

	// ✅ Get allowed origins dynamically (set via environment variable in Render)
	@Value("${cors.allowed.origins:http://localhost:3000}")
	private String allowedOrigins;

	@Bean
	public CorsFilter corsFilter() {
		CorsConfiguration config = new CorsConfiguration();

		// ✅ Split allowed origins from env var
		config.setAllowedOrigins(List.of(allowedOrigins.split(",")));

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
