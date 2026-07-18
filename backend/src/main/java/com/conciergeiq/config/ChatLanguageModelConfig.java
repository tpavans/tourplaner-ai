package com.conciergeiq.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class ChatLanguageModelConfig {

    @Value("${conciergeiq.openai.api-key:demo}")
    private String apiKey;

    @Value("${conciergeiq.openai.model-name:gpt-4o-mini}")
    private String modelName;

    @Bean
    public ChatLanguageModel chatLanguageModel() {
        if ("demo".equals(apiKey) || apiKey.trim().isEmpty()) {
            return null;
        }

        String baseUrl = "https://api.openai.com/v1";
        String targetModel = modelName;

        // Auto-detect Gemini key and redirect endpoint
        if (apiKey.startsWith("AQ")) {
            baseUrl = "https://generativelanguage.googleapis.com/v1beta/openai/";
            targetModel = "gemini-1.5-flash";
        }

        return OpenAiChatModel.builder()
                .apiKey(apiKey)
                .baseUrl(baseUrl)
                .modelName(targetModel)
                .timeout(Duration.ofSeconds(60))
                .logRequests(true)
                .logResponses(true)
                .build();
    }
}
