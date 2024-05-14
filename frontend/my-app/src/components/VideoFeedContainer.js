import { useState, useRef, useEffect } from 'react';
import Peer from "simple-peer";
import VideoFeed from './VideoFeed';
import SocketContext from '../context/SocketContext';
import { useContext } from 'react';

const VideoFeedContainer = () => {
    const socket = useContext(SocketContext);
    const [stream, setStream] = useState(null);
    const [peerStream, setPeerStream] = useState(null);
    const [myId, setMyId] = useState(null);
    const [userToCall, setUserToCall] = useState(null);
    const [status, setStatus] = useState(null);
    const [isInitiator, setIsInitiator] = useState(null);
    const [isAvailable, setIsAvailable] = useState(false);
    const [inCall, setInCall] = useState(false);
    const peerRef = useRef(null);

    useEffect(() => {
        if (socket) {
            navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream) => {
                setStream(stream);
            }).catch(error => {
                console.error("Failed to get user media", error);
            });

            socket.on("my_id", (id) => {
                setMyId(id);
                console.log("My id:", id);
            });

            socket.on("receive_signal", (signal) => {
                if (peerRef.current) {
                    console.log("Receiving signal");
                    peerRef.current.signal(signal);
                } else {
                    console.error("Peer is null");
                }
            });
        }
    }, [socket]);

    useEffect(() => {
        // If the user is available to connect, and not in a call, every 1 second, get a random
        // user to connect to until a user is found to connect to
        if (isAvailable && !inCall) {
            const interval = setInterval(() => {
                socket.emit("get_random_user", myId);

                socket.on("random_user", (data) => {
                    setUserToCall(data.id);
                    setIsInitiator(data.isInitiator);
                    console.log("My id is: " + myId + " and I am the initiator: " + data.isInitiator + " and I will call: " + data.id);
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isAvailable]);

    useEffect(() => {
        if (userToCall && stream) {
            console.log("I am : " + myId + " and I am calling: " + userToCall)
            const peer = new Peer({
                initiator: isInitiator,
                trickle: false,
                stream: stream
            })

            console.log("Peer object made")

            peer.on("signal", (signal) => {
                socket.emit("send_signal", { signal, to: userToCall });
                console.log("My id is: " + myId + " and I am sending a signal to: " + userToCall);
            });

            peer.on("stream", (stream) => {
                console.log("my id is: " + myId + " and I am receiving a stream from: " + userToCall);
                setPeerStream(stream);
                setInCall(true);
                setStatus(null);
            })

            peer.on("close", () => {
                console.log("Peer closed");
                setPeerStream(null);
                setInCall(false);
                setStatus("The call has ended.");

            });

            peer.on("error", (error) => {
                console.error("Peer error:", error);
            });

            peerRef.current = peer;
        }
    }, [userToCall, stream, isInitiator]);

    const handleSkip = () => {
        console.log("Skipping call");
        peerRef.current.destroy();
        setPeerStream(null);
        setInCall(false);
        setStatus("You have skipped the call. Looking for a user to connect to.");
        socket.emit("is_available", myId);
    }

    const handleStart = () => {
        console.log("Starting matchmaking");

        // Set status to "Looking for a user to connect to"
        setStatus("You are in matchmaking mode. Looking for a user to connect to.");

        // // Let the server know that the user is available to connect
        // socket.emit("is_available", myId);

        // Set the availability of the user to connect to true for the caller
        setIsAvailable(true);
    }

    const handleStop = () => {
        console.log("Stopping call");

        if (peerRef.current) {
            peerRef.current.destroy();
        }

        setPeerStream(null);
        setInCall(false);
        setStatus("You have stopped the call. You are no longer available to connect to other users.");
        setIsAvailable(false);
        socket.emit("is_not_available", myId);
    }



    return (
        <>
            <div className="flex justify-between items-center p-2">
                {myId}
                <div
                    className="aspect-w-16 aspect-h-9 w-full max-w-[65%]">
                    {stream && <VideoFeed key={stream.id} videoFeed={stream} myFeed={true} isStream={true}/>}
                </div>
                <div className="w-6"></div>
                <div
                    className="aspect-w-16 aspect-h-9 w-full max-w-[65%]">
                    {peerStream && <VideoFeed key={peerStream.id} videoFeed={peerStream} myFeed={false} isStream={true}/>}
                    {!peerStream && status && <p>{status}</p>}
                </div>
            </div>
            <div className="flex justify-center p-2">
                <button className={"btn btn-primary btn-sm p-2"} onClick={handleStart}>Start</button>
                <button className="btn btn-secondary btn-sm p-2" onClick={handleSkip}>Skip</button>
                <button className="btn btn-secondary btn-sm p-2" onClick={handleStop}>Stop</button>
            </div>
        </>
    );
};


export default VideoFeedContainer;
