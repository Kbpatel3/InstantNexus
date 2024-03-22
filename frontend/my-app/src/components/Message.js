import { useState, useEffect } from 'react';

const Message = ({ message, position }) => {
    // if position is "right", the message will be right-aligned use className="chat-start"
    // if position is "left", the message will be left-aligned use className="chat-end"
    return (
        <div className={`chat chat-${position}`}>
            <div className='chat-bubble chat-bubble-primary'>
                {message}
            </div>
        </div>
    )
}

export default Message;