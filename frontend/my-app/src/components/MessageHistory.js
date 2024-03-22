import Message from "./Message.js";
let { useState } = require("react");

const MessageHistory = () => {
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
        // Applying Tailwind CSS classes
        <div className="flex flex-col-reverse overflow-y-auto p-4 max-h-[200px] w-full">
            {messages.map((message, index) => {
                // Assuming your Message component is already styled or can accept `position` for custom rendering
                return <Message key={index} message={message.message} position={message.position} />;
            })}
        </div>
    );
};

export default MessageHistory;
