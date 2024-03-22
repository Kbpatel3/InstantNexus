import React from 'react';
import HomeButton from './HomeButton.js';
import AppName from './AppName.js';
import ActiveUserCount from './ActiveUserCount.js';

const TopBar = () => {
    return (
        <div className="flex justify-between items-center p-4">
            <div className="flex flex-1">
                <HomeButton />
            </div>
            <div className="flex-1 text-center">
                <AppName />
            </div>
            <div className="flex flex-1 justify-end">
                <ActiveUserCount />
            </div>
        </div>
    );
};



export default TopBar;