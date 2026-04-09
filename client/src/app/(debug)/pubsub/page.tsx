'use client';

import { Client } from "@stomp/stompjs";
import { BSON } from "bson";
import {useEffect, useState} from "react";

const PubSub = () => {
    const [inputMessage, setInputMessage] = useState("");
    const [message, setMessage] = useState({});


    const clientPub = new Client({
        brokerURL: "ws://localhost:8080/mb-ws",
            onConnect: () => {
                // encode your data as BSON bytes
                const bsonBytes = BSON.serialize({
                  text: inputMessage,
                  user: "self",
                });

                clientPub.publish({
                  destination: "/app/chat", // goes to Spring first
                  binaryBody: bsonBytes,
                  headers: { "content-type": "application/octet-stream" },
                });
            },
    });

    const clientSub = new Client({
        brokerURL: "ws://localhost:8080/mb-ws",
        onConnect: () => {
            clientSub.subscribe("/topic/chat", (message) => {
            // decode the BSON bytes back
            const data = BSON.deserialize(message.binaryBody);
            console.log(data);
            setMessage(data);
            clientPub.deactivate()      // deactivate publisher after receiving the message
            });
        },
    });


    useEffect(() => {
        clientSub.activate()

        return () => {
            clientSub.deactivate()
        }
    }, []);


    async function publishMessage() {
        clientPub.activate();
    }

    return (
      <div>
        <h1>Pub/Sub Test</h1>
        <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
        <button onClick={publishMessage}>Publish</button>

        <h3>{JSON.stringify(message)}</h3>
      </div>
    );
}


export default PubSub;


