import React, { useState, useEffect } from 'react';
import SocketContext from "../context/SocketContext";
import { useContext } from 'react';

const ActiveUserCount = () => {
    const socket = useContext(SocketContext);
    const [user_count, set_user_count] = useState(0);

    // Update the user count every 5 seconds
    useEffect(() => {
        if (socket) {
            socket.on("user_count", (count) => {
                set_user_count(count);
            });

            const interval = setInterval(() => {
                socket.emit("get_user_count");
            }, 3000);

            return () => {
                clearInterval(interval);
                socket.off("user_count");
            };
        }
    }, [socket]);

    return (
        <div className="flex flex-col items-start max-w-[120px]">
            {/* Flex container to arrange items in a column */}
            <div className="text-lg m-0 w-full text-center">Active Users</div> {/* Title centered */}
            <div className="text-lg m-0 w-full flex justify-center"> {/* Center userCount horizontally */}
                <span>{user_count}</span> {/* User count */}
            </div>
        </div>
    );
};

export default ActiveUserCount;