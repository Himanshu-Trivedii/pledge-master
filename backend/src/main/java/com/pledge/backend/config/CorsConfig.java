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

		// 🔓 Allow localhost during development
		config.setAllowedOriginPatterns(List.of(
				"http://localhost:*",
				"http://127.0.0.1:*"
		));

		// ✅ Allow credentials (cookies, auth headers)
		config.setAllowCredentials(true);

		// ✅ Allow all necessary headers
		config.setAllowedHeaders(List.of(
				"Origin",
				"Content-Type",
				"Accept",
				"Authorization"
		));

		// ✅ Allow all common methods
		config.setAllowedMethods(List.of(
				"GET",
				"POST",
				"PUT",
				"DELETE",
				"OPTIONS"
		));

		// ✅ Expose headers if needed
		config.setExposedHeaders(List.of("Authorization"));

		// ✅ Apply CORS config globally
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);

		return new CorsFilter(source);
	}
}
