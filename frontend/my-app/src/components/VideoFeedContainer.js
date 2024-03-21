import { useState, useEffect } from 'react';
import VideoFeed from './VideoFeed';

const VideoFeedContainer = () => {
    return (
        <div className="flex justify-between items-center p-4">
            <VideoFeed />
            <div className="w-4 h-full"></div>
            <VideoFeed />
        </div>
    );
};

export default VideoFeedContainer;