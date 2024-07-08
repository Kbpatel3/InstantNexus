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
    const [isInitiator, setIsInitiator] = useState(false);

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
                    console.error("No camera or microphone found. Please check your devices.");
                } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                    console.error("Permission denied. Please allow access to camera and" +
                    " microphone.");
                } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
                    console.error("Constraints cannot be satisfied by available devices. Please" +
                        " check your settings.");
                } else {
                    console.error("Failed to access camera or microphone. Please check" +
                        " permissions and" +
                        " devices.");
                }
            }
        };

        getMedia();
        setStatus("You are not in matchmaking mode. Click the Start button to start matchmaking.");

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (socket) {
            const handleMyId = (id) => {
                setMyId(id);
                console.log("My id:", id);
            };

            const handleSignal = async ({ signal, from }) => {
                if (!peerRef.current) {
                    const peer = new window.SimplePeer({
                        initiator: isInitiator,
                        trickle: false,
                        stream: stream,
                    });

                    peer.on("signal", (signal) => {
                        socket.emit("signal", { userToSignal: from, signal: signal });
                    });

                    peer.on("stream", (userStream) => {
                        setRemoteStream(userStream);
                    });

                    peerRef.current = peer;
                }

                try {
                    await peerRef.current.signal(signal);
                } catch (error) {
                    console.error("Error during signaling:", error);
                }
            };

            const handleCallEndedNotification = (message) => {
                setStatus(message);
                console.log("State before client call ended:", isAvailable, inCall);
                setIsAvailable(true);
                setInCall(false);
                setUserToCall(null);
                setRemoteStream(null);
                setIsInitiator(false);
                if (peerRef.current) {
                    peerRef.current.destroy();
                    peerRef.current = null;
                }
                socket.emit("is_available", myId);
            };

            socket.on("my_id", handleMyId);
            socket.on("signal", handleSignal);
            socket.on("call_ended_notification", handleCallEndedNotification);

            return () => {
                socket.off("my_id", handleMyId);
                socket.off("signal", handleSignal);
                socket.off("call_ended_notification", handleCallEndedNotification);
            };
        }
    }, [socket, stream, isInitiator]);

    useEffect(() => {
        if (isAvailable && !inCall) {
            console.log("About to get random user");
            const interval = setInterval(() => {
                console.log("Asking server for random user")
                socket.emit("get_random_user", myId);
                console.log("Asked server for random user")
                socket.on("random_user", (data) => {
                    console.log("Received random user from server")
                    if (data.id) {
                        setUserToCall(data.id);
                        setInCall(true);
                        setIsInitiator(data.isInitiator);
                        console.log(`My id is: ${myId} and I am the initiator: ${data.isInitiator} and I will call: ${data.id}`);
                    }
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isAvailable, inCall, myId, socket]);

    useEffect(() => {
        if (userToCall) {
            const peer = new window.SimplePeer({
                initiator: isInitiator,
                trickle: false,
                stream: stream,
            });

            peer.on("signal", (signal) => {
                socket.emit("signal", { userToSignal: userToCall, signal: signal });
            });

            peer.on("stream", (userStream) => {
                setRemoteStream(userStream);
            });

            peer.on("error", (error) => {
                console.error("Peer error:", error);
                handleStop();
            })

            peerRef.current = peer;
        }
    }, [userToCall, stream, socket, isInitiator]);

    const handleStart = () => {
        setStatus("You are in matchmaking mode. Looking for a user to connect to.");
        socket.emit("is_available", myId);
        setIsAvailable(true);
    };

    const handleSkip = () => {
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
        setRemoteStream(null);
        setInCall(false);
        setStatus("You have skipped the call. Looking for a user to connect to.");
        setIsAvailable(true);
        setIsInitiator(false);
        setUserToCall(null);
        socket.emit("is_available", myId);
        socket.emit("call_ended", { id: myId, userToNotify: userToCall });
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
        setIsInitiator(false);
        setUserToCall(null);
        socket.emit("is_not_available", myId);
        socket.emit("call_ended", { id: myId, userToNotify: userToCall });
    };

    return (
        <>
            <div className="flex justify-between items-center p-2">
                <div className="aspect-w-16 aspect-h-9 w-full max-w-[65%]">
                    <VideoFeed videoFeed={stream} myFeed={true} isStream={true} />
                </div>
                <div className="w-6"></div>
                <div className="aspect-w-16 aspect-h-9 w-full max-w-[65%]">
                    {remoteStream ? (
                        <VideoFeed videoFeed={remoteStream} myFeed={false} isStream={true} />
                    ) : (
                        <p>{status}</p>
                    )}
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
