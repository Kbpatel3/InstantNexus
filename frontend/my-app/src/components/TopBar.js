import React from 'react';
import HomeButton from './HomeButton.js';
import AppName from './AppName.js';
import ActiveUserCount from './ActiveUserCount.js';

const TopBar = () => {
    return (
        <>
            <div className="flex justify-between items-center p-4">
                <HomeButton />
                <AppName />
                <ActiveUserCount />
            </div>
        </>
    );
};

export default TopBar;