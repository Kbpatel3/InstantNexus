import { useState, useRef, useEffect } from 'react';
import Peer from "simple-peer";
import VideoFeed from './VideoFeed';
import SocketContext from '../context/SocketContext';
import { useContext } from 'react';

const VideoFeedContainer = () => {
    const socket = useContext(SocketContext);
    const [myId, setMyId] = useState("");
    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [idToCall, setIdToCall] = useState("");
    const [callEnded, setCallEnded] = useState(false);
    const [userStream, setUserStream] = useState(null);

    const connectionRef = useRef(null);

    useEffect(() => {
        if (socket) {
            navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream) => {
                console.log("Stream active:", stream.active); // Check if the stream is active
                stream.getTracks().forEach(track => {
                    console.log(track.kind + " track ready state:", track.readyState); // Should be 'live'
                });

                setStream(stream);
            }).catch(error => {
                console.error("Failed to get user media", error);
            });

            socket.on('my_id', (id) => {
                console.log("My id:", id); // Debugging: Print the id of the user (socket id)
                setMyId(id);
            });

            socket.on("callUser", (data) => {
                setReceivingCall(true);
                setCaller(data.from);
                setCallerSignal(data.signal);
            });
        }
    }, [socket]);


    const callUser = () => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (data) => {
            socket.emit("callUser", {
                signalData: data,
                from: myId,
            });
        });

        peer.on("stream", (stream) => {
            setUserStream(stream);
        });

        socket.on("callAccepted", (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        peer.signal(callerSignal);
    }

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (data) => {
            socket.emit("answerCall", { signal: data, to: caller });
        });

        peer.on("stream", (stream) => {
            setUserStream(stream);
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
      setCallEnded(true);
      connectionRef.current.destroy();
    };

    const handleSkip = () => {
        leaveCall();
    }

    const handleStart = () => {
        if (receivingCall) {
            answerCall();
        } else {
            callUser();
        }
    }

    const handleStop = () => {
        leaveCall();
    }

    return (
        <>
            <div className="flex justify-between items-center p-2">
                <div
                    className="aspect-w-16 aspect-h-9 w-full max-w-[65%]"> {/* Adjust aspect
                     ratio and width */}
                    {stream && <VideoFeed key={stream.id} videoFeed={stream} myFeed={true} isStream={true}/>}
                </div>
                <div className="w-6"></div>
                <div
                    className="aspect-w-16 aspect-h-9 w-full max-w-[65%]"> {/* Adjust aspect
                     ratio and width */}
                    {callAccepted && !callEnded && userStream ?
                        <VideoFeed key={stream.id} videoFeed={stream} myFeed={false} isStream={true}/>
                    : null}
                </div>
            </div>
            <div className="flex justify-center p-2"> {/* Updated classes for horizontal
             centering */}
                <button className={"btn btn-primary btn-sm p-2"} onClick={handleStart}>Start</button>
                <button className="btn btn-secondary btn-sm p-2" onClick={handleSkip}>Skip</button>
                <button className="btn btn-secondary btn-sm p-2" onClick={handleStop}>Stop</button>
            </div>
        </>
    );
};


export default VideoFeedContainer;
