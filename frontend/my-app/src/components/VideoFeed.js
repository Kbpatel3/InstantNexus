import { useEffect, useState, useRef } from 'react';

const VideoFeed = ({ videoFeed, myFeed, isStream = false }) => {
    // Get the width of the window
    const [width, setWidth] = useState(window.innerWidth);

    // Video Ref
    const videoRef = useRef(null);

    // Check if the video feed is a stream
    useEffect(() => {
        if (videoRef.current && isStream && videoFeed) {
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
        <div className="relative mx-auto max-w-3xl bg-black" style={{ paddingTop: '56.25%' }}>
            {videoFeed ? (
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    playsInline={true}
                    autoPlay={true}
                    muted={myFeed}
                    ref={videoRef}
                    src={!isStream ? videoFeed : undefined}
                    onCanPlay={() => videoRef.current.play()}
                    style={myFeed ? { transform: 'scaleX(-1)' } : {}}
                ></video>
            ) : (
                <div className={"absolute top-0 left-0 w-full h-full flex items-center justify-center text-lg text-white"} style={{fontSize: '1rem'}}>
                    {myFeed}
                </div>
            )}
        </div>
    );

};

export default VideoFeed;