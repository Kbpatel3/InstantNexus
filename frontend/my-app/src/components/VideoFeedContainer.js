import { useState, useRef, useEffect } from 'react';
import Peer from "simple-peer";
import { io } from "socket.io-client";
import VideoFeed from './VideoFeed';

const socket = io.connect("http://localhost:5000");

const VideoFeedContainer = () => {
    const [myId, setMyId] = useState("");
    const [stream, setStream] = useState();
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [idToCall, setIdToCall] = useState("");
    const [callEnded, setCallEnded] = useState(false);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream);
            myVideo.current.srcObject = stream;
        });

        socket.on('me', (id) => {
            setMyId(id);
        });

        socket.on("callUser", (data) => {
            setReceivingCall(true);
            setCaller(data.from);
            setCallerSignal(data.signal);
        });
    }, []);

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
            userVideo.current.srcObject = stream;
        });

        socket.on("callAccepted", (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
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
            userVideo.current.srcObject = stream;
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
                    {stream && <VideoFeed videoFeed={myVideo} myFeed={true}/>}
                </div>
                <div className="w-6"></div>
                <div
                    className="aspect-w-16 aspect-h-9 w-full max-w-[65%]"> {/* Adjust aspect
                     ratio and width */}
                    {callAccepted && !callEnded ?
                        <VideoFeed videoFeed={userVideo} myFeed={false}/>
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
