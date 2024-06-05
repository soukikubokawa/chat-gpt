"use client"

import React, { useEffect, useRef, useState } from 'react'
import { IoIosPaperPlane } from 'react-icons/io';
import { db } from '../../../firebase';
import { Timestamp, addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useAppContext } from '@/context/AppContext';
import OpenAI from 'openai';
import LoadingIcons from 'react-loading-icons';

type Message = {
    text: string;
    sender: string;
    createdAt: Timestamp;
}

const Chat = () => {
    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
        dangerouslyAllowBrowser: true,
    });

    const { selectedRoom, selectedRoomName } = useAppContext();
    const [inputMessage, setInputMessage] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<Boolean>();

    // 一番下まで自動スクロールをする
    const scrollDiv = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollDiv.current) {
            const element = scrollDiv.current;
            element.scrollTo({
                top: element.scrollHeight,
                behavior: "smooth",
            })
        };
    }, [messages]);

    // 各roomにおけるメッセージを取得する
    useEffect(() => {
        if (selectedRoom) {
            const fetchMessages = async () => {
                const roomDocRef = doc(db, "rooms", selectedRoom);
                const messagesCollectionRef = collection(roomDocRef, "messages")
                const q = query(messagesCollectionRef, orderBy("createdAt"));
    
                // onSnapshot関数で監視をし続ける
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const newMessages = snapshot.docs.map((doc) => doc.data() as Message);
                    setMessages(newMessages);
                });
    
                return () => {
                    unsubscribe();
                };
            };
            fetchMessages();
        }

    }, [selectedRoom]);

    const sendMessage = async () => {
        if (!inputMessage.trim()) {
            return;
        } else if (!selectedRoom) {
            alert("Please select a room.");
            return;
        };

        const messageData = {
            text: inputMessage,
            sender: "user",
            createdAt: serverTimestamp(),
        };

        setInputMessage("");

        //store message in Firestore
        const roomDocRef = doc(db, "rooms", selectedRoom!); // dbの中でidが"xxx"のroomsを取得する
        const messageCollectionRef = collection(roomDocRef, "messages"); // そのroomのmessagesを取得する
        await addDoc(messageCollectionRef, messageData);

        setIsLoading(true);

        // response from openAI
        const gpt3Response = await openai.chat.completions.create({
            messages: [{ role: "user", content: inputMessage }],
            model: "gpt-3.5-turbo-0125",
        });
        
        setIsLoading(false);

        //store response message in Firestore
        const botResponse = gpt3Response.choices[0].message.content;
        const responseData = {
            text: botResponse,
            sender: "bot",
            createdAt: serverTimestamp(),
        };
        await addDoc(messageCollectionRef, responseData);
    };
    
  return (
    <div className='bg-gray-500 h-full p-4 flex flex-col'>
        <h1 className='text-2xl text-white font-semibold mb-4'>{ selectedRoomName }</h1>
        <div className='flex-grow overflow-y-auto overflow-scroll mb-4' ref={scrollDiv}>
            {messages.map((message, index) => (
                <div key={index} className={message.sender === "user" ? 'text-right' : 'text-left'}>
                    <div className={message.sender === "user" 
                                    ? 'bg-blue-500 inline-block rounded px-4 py-2 mb-2' 
                                    : 'bg-green-500 inline-block rounded px-4 py-2 mb-2'}>
                        <p className='text-white'>{message.text}</p>
                    </div>
                </div>
            ))}
            {isLoading && <LoadingIcons.TailSpin />}

        </div>

        <div className='flex-shrink-0 relative'>
            <input type='text' value={inputMessage}
                placeholder='send a message'
                className='border-2 rounded w-full pr-10 focus:outline-none p-2'
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key == "Enter") {
                        sendMessage();
                    }
                }}>
            </input>
            <button className='absolute inset-y-0 right-2 flex items-center'
                    onClick={() => sendMessage()}>
                <IoIosPaperPlane />
            </button>
        </div>
    </div>
  )
};

export default Chat