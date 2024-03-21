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
        <div>
            <video
                className="w-full h-auto"
                controls
                src={tempVideo}
            ></video>
        </div>
    );
};

export default VideoFeed;