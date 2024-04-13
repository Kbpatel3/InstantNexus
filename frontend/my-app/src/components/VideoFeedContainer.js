import { useState, useEffect } from 'react';
import VideoFeed from './VideoFeed';

const VideoFeedContainer = () => {
    return (
        <div className="flex justify-between items-center p-4">
            <div className="aspect-w-16 aspect-h-9 w-full max-w-[65%]"> {/* Adjust aspect ratio and width */}
                <VideoFeed />
            </div>
	    <div className="w-6"></div>
            <div className="aspect-w-16 aspect-h-9 w-full max-w-[65%]"> {/* Adjust aspect ratio and width */}
                <VideoFeed />
            </div>
        </div>
	<div>
	    <button>Skip</button>
	</div>
    );
};


export default VideoFeedContainer;
