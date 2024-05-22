import { useEffect, useState, useRef } from 'react';

const VideoFeed = ({ videoFeed, myFeed, isStream = false }) => {
    // Get the width of the window
    const [width, setWidth] = useState(window.innerWidth);

    // Video Ref
    const videoRef = useRef(null);

    // Check if the video feed is a stream
    useEffect(() => {
        if (isStream && videoRef.current && videoFeed) {
            videoRef.current.srcObject = videoFeed;
        }

    }, [videoFeed, isStream])

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
            {videoFeed ? (
                <video
                    className="w-full h-auto"
                    playsInline={true}
                    autoPlay={true}
                    muted={myFeed}
                    ref={videoRef}
                    src={!isStream ? videoFeed : undefined}
                    onCanPlay={() => videoRef.current.play()}
                    style={myFeed ? {transform: 'scaleX(-1)'} : {transform: 'scaleX(-1)'}}
                ></video>
            ) : (
                <div className={"w-full h-auto flex items-center justify-center"} style={{fontSize: '1rem'}}>
                    {myFeed}
                </div>
            )}
        </div>
    );

};

export default VideoFeed;