import React, { useState, useEffect } from 'react';

const ActiveUserCount = () => {
    const [user_count, set_user_count] = useState(0);

    useEffect(() => {
        // This is for demonstration. In a real application, you'd likely update the count based on some event.
        const interval = setInterval(() => {
            set_user_count((user_count) => user_count + 1);
        }, 1); // Update the count every second as an example

        return () => clearInterval(interval); // Clear the interval on component unmount
    }, []); // Empty dependency array ensures this effect runs only once on mount

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