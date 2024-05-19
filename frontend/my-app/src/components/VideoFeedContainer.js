import { useState, useRef, useEffect, useContext } from 'react';
import VideoFeed from './VideoFeed';
import SocketContext from '../context/SocketContext';

const VideoFeedContainer = () => {
    const socket = useContext(SocketContext);
    const [stream, setStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [myId, setMyId] = useState(null);
    const [userToCall, setUserToCall] = useState(null);
    const [status, setStatus] = useState(null);
    const [isAvailable, setIsAvailable] = useState(false);
    const [inCall, setInCall] = useState(false);
    const peerRef = useRef(null);

    useEffect(() => {
        const getMedia = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const hasVideoInput = devices.some(device => device.kind === 'videoinput');
                const hasAudioInput = devices.some(device => device.kind === 'audioinput');

                if (hasVideoInput && hasAudioInput) {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    setStream(stream);
                } else {
                    throw new Error("No video or audio input devices found");
                }
            } catch (error) {
                console.error("Failed to get user media", error);

                // Check for specific error types
                if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                    setStatus("No camera or microphone found. Please check your devices.");
                } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                    setStatus("Permission denied. Please allow access to camera and microphone.");
                } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
                    setStatus("Constraints cannot be satisfied by available devices. Please check your settings.");
                } else {
                    setStatus("Failed to access camera or microphone. Please check permissions and devices.");
                }
            }
        };

        getMedia();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on("my_id", (id) => {
                setMyId(id);
                console.log("My id:", id);
            });

            socket.on("signal", ({ signal, from }) => {
                if (peerRef.current) {
                    peerRef.current.signal(signal);
                } else {
                    const peer = new window.SimplePeer({
                        initiator: false,
                        trickle: false,
                        stream: stream
                    });

                    peer.on("signal", (signal) => {
                        socket.emit("signal", { userToSignal: from, signal: signal });
                    });

                    peer.on("stream", (userStream) => {
                        setRemoteStream(userStream);
                    });

                    peer.signal(signal);
                    peerRef.current = peer;
                }
            });

            return () => {
                socket.off("my_id");
                socket.off("signal");
            };
        }
    }, [socket, stream]);

    useEffect(() => {
        if (isAvailable && !inCall) {
            const interval = setInterval(() => {
                socket.emit("get_random_user", myId);

                socket.on("random_user", (data) => {
                    if (data.id) {
                        setUserToCall(data.id);
                        setInCall(true);
                        console.log(`My id is: ${myId} and I am the initiator: ${data.isInitiator} and I will call: ${data.id}`);

                        const initiator = data.isInitiator;

                        if (initiator) {
                            const peer = new window.SimplePeer({
                                initiator: true,
                                trickle: false,
                                stream: stream,
                            });

                            peer.on("signal", (signal) => {
                                socket.emit("signal", { userToSignal: data.id, signal: signal });
                            });

                            peer.on("stream", (userStream) => {
                                setRemoteStream(userStream);
                            });

                            peerRef.current = peer;
                        }
                    }
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isAvailable, inCall, myId, socket]);

    useEffect(() => {
        if (userToCall && !inCall) {
            const peer = new window.SimplePeer({
                initiator: false,
                trickle: false,
                stream: stream,
            });

            peer.on("signal", (signal) => {
                socket.emit("signal", { userToSignal: userToCall, signal: signal });
            });

            peer.on("stream", (userStream) => {
                setRemoteStream(userStream);
            });

            peerRef.current = peer;
        }
    }, [userToCall, stream, socket]);

    const handleSkip = () => {
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
        setRemoteStream(null);
        setInCall(false);
        setStatus("You have skipped the call. Looking for a user to connect to.");
        socket.emit("is_available", myId);
    };

    const handleStart = () => {
        setStatus("You are in matchmaking mode. Looking for a user to connect to.");
        setIsAvailable(true);
    };

    const handleStop = () => {
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
        setRemoteStream(null);
        setInCall(false);
        setStatus("You have stopped the call. You are no longer available to connect to other users.");
        setIsAvailable(false);
        socket.emit("call_ended", myId);
        socket.emit("is_not_available", myId);
    };

    return (
        <>
            <div className="flex justify-between items-center p-2">
                {myId}
                <div className="aspect-w-16 aspect-h-9 w-full max-w-[65%]">
                    <VideoFeed videoFeed={stream} myFeed={true} isStream={true} />
                </div>
                <div className="w-6"></div>
                <div className="aspect-w-16 aspect-h-9 w-full max-w-[65%]">
                    <VideoFeed videoFeed={remoteStream} myFeed={false} isStream={true} />
                    {!remoteStream && status && <p>{status}</p>}
                </div>
            </div>
            <div className="flex justify-center p-2">
                <button className="btn btn-primary btn-sm p-2" onClick={handleStart}>Start</button>
                <button className="btn btn-secondary btn-sm p-2" onClick={handleSkip}>Skip</button>
                <button className="btn btn-secondary btn-sm p-2" onClick={handleStop}>Stop</button>
            </div>
        </>
    );
};

export default VideoFeedContainer;
