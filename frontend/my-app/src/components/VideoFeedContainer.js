import { useState, useRef, useEffect } from 'react';
import Peer from "simple-peer";
import { io } from "socket.io-client";
import VideoFeed from './VideoFeed';
import { eventEmitter } from '../event/EventEmitter';

const socket = io.connect("http://localhost:5000");

const VideoFeedContainer = () => {
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
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
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
    }, []);

    
    useEffect(() => {
        console.log("Waiting for user count... event to be emitted from ActiveUserCount.js")
        // Event Emitter for getting user count
        eventEmitter.on("get_user_count", () => {
            console.log("ActiveUserCount.js emitted get_user_count event")
            socket.emit("get_user_count");
            console.log("Emitted to backend")

            socket.on("user_count", (count) => {
                console.log("Received user count from backend")
                console.log(count);
                eventEmitter.emit("user_count", count);
            });
        });
    })


    const callUser = (id) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (data) => {
            socket.emit("callUser", {
                userToCall: id,
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
                        <VideoFeed videoFeed={userStream} myFeed={false} isStream={true}/>
                    : null}
                </div>
            </div>
            <div className="flex justify-center"> {/* Updated classes for horizontal
             centering */}
                <button className="btn btn-secondary btn-sm">Skip</button>
            </div>
        </>
    );
};


export default VideoFeedContainer;
