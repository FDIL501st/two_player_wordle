'use client';

import { Client, IMessage } from "@stomp/stompjs";
import { BSON } from "bson";
import {useEffect, useState, useRef} from "react";

const PubSub = () => {
    const clientPubRef = useRef<Client | null>(null);
    const [inputMessage, setInputMessage] = useState("");
    const [message, setMessage] = useState({});


    function sendMessage() {
        const clientPub = clientPubRef.current;
        if (!clientPub) {
            console.error("Publisher client is not initialized.");
            return;
        }

        // encode your data as BSON bytes
        const bsonBytes = BSON.serialize({
            text: inputMessage,
            user: "self",
        });

        clientPub.publish({
            destination: "/topic/chat", // goes to Spring first
            binaryBody: bsonBytes,
            headers: { "content-type": "application/octet-stream" },
        });
    }

    function handleMessage(message: IMessage) {
        // decode the BSON bytes back
        // expect data to be binary and have content-type header set to application/octet-stream
        const data = BSON.deserialize(message.binaryBody);
        setMessage(data);
    }




    useEffect(() => {
        const clientPub = new Client({
            brokerURL: "ws://localhost:15674/ws",
            connectHeaders: {
                login: "guest",
                passcode: "guest",
            },
            onConnect: () => {
                console.log("Publisher connected");
            },
            debug: (str) => {
                console.log("STOMP Pub Debug:", str);
            },
            onWebSocketError: (event) => {
                console.error("WebSocket Pub error:", event);
            },
            onStompError: (frame) => {
                console.error("STOMP Pub error:", frame);
            },
        })
        clientPubRef.current = clientPub;
        clientPub.activate();
        
        const clientSub = new Client({
            brokerURL: "ws://localhost:15674/ws",
            connectHeaders: {
                login: "guest",
                passcode: "guest",
            },
            onConnect: () => {
                clientSub.subscribe("/topic/chat", handleMessage);
            },
            debug: (str) => { 
                console.log("STOMP Sub Debug:", str) 
            },
            onWebSocketError: (event) => {
                console.error("WebSocket Sub error:", event);
            },
            onStompError: (frame) => {
                console.error("STOMP Sub error:", frame);
            },
        });
        clientSub.activate()

        return () => {
            clientSub.deactivate()
            clientPub.deactivate()
        }
    }, []);

    return (
      <div>
        <h1>Pub/Sub Test</h1>
        <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
        <button onClick={sendMessage}>Publish</button>

        <h3>{JSON.stringify(message)}</h3>
      </div>
    );
}


export default PubSub;


