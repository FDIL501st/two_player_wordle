package com.fdil.message_broker;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @MessageMapping("/chat")        // receives from /app/chat
    @SendTo("/topic/chat")          // broadcasts to /topic/chat via RabbitMQ
    public byte[] handleMessage(@Payload byte[] bsonPayload) {
        return bsonPayload;         // just forward the bytes as-is
    }
}