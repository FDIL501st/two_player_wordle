'use client'

import mqtt from 'mqtt'
import {serialize, deserialize} from 'bson'
import { useEffect, useState, useRef } from 'react';
import { Buffer } from 'buffer';


const MQTT = () => {
    const [message, setMessage] = useState('');
    const [receivedMessage, setReceivedMessage] = useState('');

    const clientRef = useRef<mqtt.MqttClient | null>(null);
    // we start with null and move initialization logic to useEffect, 
    // this is because initializing within useRef, it still makes a connection every re-render, just throw away the connection immediately,
    // which leads to many connections made without being closed properly

    // moving to useEffect means connection occurs once (within useEffect)

    useEffect(() => {
        clientRef.current = mqtt.connect('ws://127.0.0.1:15675/ws', {
            username: 'guest',
            password: 'guest',
            // RabbitMQ requires a clientId
            clientId: 'browser-' + Math.random().toString(16).slice(2),
            reconnectPeriod: 1000, // try to reconnect every 1 second
            connectTimeout: 30000, // 30 seconds timeout for initial connection
        })
        const client = clientRef.current;

        client.on('connect', () => {
            console.log('connected to rabbitmq with mqtt over websocket')

            // also subscribe to the topic to receive messages after connection is established
            client.subscribe('bson/test', { qos: 0 }, (err) => {
                if (err) {
                    console.error('subscribe error', err)
                } else {
                    console.log('subscribed to bson/test')
                }
            })
        })

        client.on('error', (err) => {
            console.error('connection error', err)
        })

        clientRef.current.on('message', (topic, payload) => {
            // payload is a Buffer, convert to Uint8Array for BSON deserialization
            const data = deserialize(new Uint8Array(payload))
            console.log(`Received message on topic "${topic}":`, data)
            setReceivedMessage(data.text)
        })

        return () => {
            client.end()
        }
    }, [])
    
    
    function sendMessage() {
        const client = clientRef.current;
        if (client == null) {
            console.error('MQTT client is not connected')
            return
        }

        const jsonData = {
            user: 'browser',
            text: message,
            timestamp: new Date()
        }
        const payload = serialize(jsonData)
        // serialize returns a Uint8Array, but mqtt.js expects a Buffer type

        client.publish('bson/test', Buffer.from(payload), { qos: 0 }, (err) => {
            if (err) {
                console.error('publish error', err)
            } else {
                console.log(`Published to bson/test:`, payload)
            }
        })
    }



    return (
        <div>
            <h1>MQTT Debug Page</h1>
            <p>This page is for testing MQTT over WebSocket connection to RabbitMQ.</p>

            <div>
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
                <button onClick={sendMessage}>Send Message</button>
            </div>

            <p>Received Message: {receivedMessage}</p>
        </div>
    );
}

export default MQTT;