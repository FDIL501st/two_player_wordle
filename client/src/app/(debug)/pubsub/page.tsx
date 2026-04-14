'use client';

import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { BSON } from "bson";
import {useEffect, useState, useRef} from "react";

const PubSub = () => {
    const clientPubRef = useRef<Client | null>(null);
    const SubscriptionRef = useRef<StompSubscription | null>(null);
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
                console.log("Subscriber connected");
                const subscription = clientSub.subscribe("/topic/chat", handleMessage);
                SubscriptionRef.current = subscription;
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
        // clientSub.subscribe("/topic/chat", handleMessage);
        // moving it here failed, it seems that is because clientSub not yet created within UseEffect

        clientSub.activate()

        return () => {
            // if (SubscriptionRef.current) {
            //     SubscriptionRef.current.unsubscribe();
            // }
            // No need to unsubscribe, as the client will be deactivated and all subscriptions will be cleaned up

            // only need to unsubscribe if we want to stop receiving messages but keep the connection/client alive for other purposes. 
            // IFor example, changing the subscription topic or callback without disconnecting the client.
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


