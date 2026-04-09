package com.fdil.message_broker;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        // prefix of url to connect to this app with
        config.setApplicationDestinationPrefixes("/app");

        // read env variables for some options set for connecting to rabbitmq
        String login = System.getenv("RABBITMQ_LOGIN");
        String password = System.getenv("RABBITMQ_PASSWORD");
        String host = System.getenv("RABBITMQ_HOST");
        // set default values if needed
        if (login == null) {
            login = "guest";
        }
        if (password == null) {
            password = "guest";
        }
        if (host == null) {
            host = "localhost";
        }

        System.out.println("Using RabbitMQ with login: " + login + ", password: " + password + ", host: " + host);

        // the topics rabbitmq will handle
        config.enableStompBrokerRelay("/topic")
                .setClientLogin(login)
                .setClientPasscode(password)
                .setRelayHost(host)
                .setRelayPort(61613);
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // url endpoint to when communicating with this server with STOMP
        registry.addEndpoint("/mb-ws")
        // message_broker-websocket
                .setAllowedOrigins("http://localhost:3000");    // allow CORS for local development, adjust as needed for production
    }

}
