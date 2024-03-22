import { useEffect, useState } from 'react';
import tempVideo from './temp.mp4';

const VideoFeed = () => {
    // Get the width of the window
    const [width, setWidth] = useState(window.innerWidth);

    // Update the width when the window resizes
    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="aspect-w-16 aspect-h-9 mx-auto max-w-3xl">
            <video
                className="w-full h-auto"
                controls
                src={tempVideo}
            ></video>
        </div>
    );
    
};

export default VideoFeed;