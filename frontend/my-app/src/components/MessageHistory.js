import Message from "./Message.js";
import SocketContext from '../context/SocketContext';
import {useContext} from "react";
let { useState } = require("react");

const MessageHistory = () => {
    const socket = useContext(SocketContext);

    const [messages, setMessages] = useState([
        { message: "Hello, World!", position: "end" },
        { message: "Hi, there!", position: "start" },
        { message: "How are you?", position: "end" },
        { message: "I'm good, thanks!", position: "start" },
        { message: "What are you up to?", position: "end" },
        { message: "Nothing much, just chilling", position: "start" },
        { message: "Cool, cool", position: "end" },
        { message: "Yeah", position: "start" },
        { message: "I'm bored", position: "end" },
        { message: "I'm sorry to hear that", position: "start" },
        { message: "It's okay", position: "end" },
        { message: "I'm here for you", position: "start" },
        { message: "Thanks", position: "end" },
        { message: "You're welcome", position: "start" },
        { message: "I'm going to go now", position: "end" },
        { message: "Okay, bye", position: "start" }
    ]);

    return (
        <div className="flex flex-col-reverse overflow-y-auto p-2 max-h-[200px] w-full bg-[#282c34] rounded-lg">
            {messages.map((message, index) => {
                return <Message key={index} message={message.message} position={message.position} />;
            })}
        </div>
    );
};

export default MessageHistory;
