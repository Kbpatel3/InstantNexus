import { useState, useEffect } from 'react';
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
    const [callAccepted, setCallAccepted] = useState(false);
    const [receivedCall, setReceivedCall] = useState(false);
    const [caller, setCaller] = useState(null);
    const [callerSignal, setCallerSignal] = useState(null);

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

            socket.on("my_id", (id) => {
                setMyId(id);
                console.log("My id:", id);
            });

            socket.on("call", (data) => {
                setReceivedCall(true);
                setCaller(data.from);
                setCallerSignal(data.signal);
            });
        }
    }, [socket]);

    function callUser() {
        // Get a random user to connect to
        socket.emit("get_random_user", myId);

        // Handle the random_user event
        socket.on("random_user", (randomUser) => {
            console.log("Random user:", randomUser);
            setUserToCall(randomUser);
        });

        // Create a new peer connection
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream
        });

        peer.on("signal", (data) => {
            socket.emit("callUser", { userToCall: userToCall, signalData: data, from: myId})
        });

        peer.on("stream", (stream) => {
            setPeerStream(stream);
        });

        socket.on("callAccepted", (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });
    }

    function answerCall() {
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream
        });

        peer.on("signal", (data) => {
            socket.emit("answerCall", { signal: data, to: caller });
        });

        peer.on("stream", (stream) => {
            setPeerStream(stream);
        })

        peer.signal(callerSignal);
    }

    const handleSkip = () => {
        console.log("Skipping call");
    }

    const handleStart = () => {
        console.log("Starting matchmaking");

        if (receivedCall && !callAccepted) {
            console.log("Answering call")
            answerCall();
        }
        else {
            console.log("Calling user")
            callUser();
        }
    }

    const handleStop = () => {
        console.log("Stopping call");
    }



    return (
        <>
            <div className="flex justify-between items-center p-2">
                <div
                    className="aspect-w-16 aspect-h-9 w-full max-w-[65%]">
                    {stream && <VideoFeed key={stream.id} videoFeed={stream} myFeed={true} isStream={true}/>}
                </div>
                <div className="w-6"></div>
                <div
                    className="aspect-w-16 aspect-h-9 w-full max-w-[65%]">
                    {peerStream && <VideoFeed key={peerStream.id} videoFeed={peerStream} myFeed={false} isStream={true}/>}
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
