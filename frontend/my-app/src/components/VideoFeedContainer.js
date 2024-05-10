import { useState, useEffect } from 'react';
import Peer from "simple-peer";
import VideoFeed from './VideoFeed';
import SocketContext from '../context/SocketContext';
import { useContext } from 'react';

const VideoFeedContainer = () => {
    const socket = useContext(SocketContext);
    const [stream, setStream] = useState(null);
    const [peerStream, setPeerStream] = useState(null);

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

            // Listen for the connect_to event
            socket.on('connect_to', ({ peerId }) => {
                console.log("Connecting to peer", peerId);

                // Create a new peer connection
                const peer = new Peer({
                    initiator: true,
                    trickle: false,
                    stream: stream,
                });

                // Listen for the signal event
                peer.on('signal', (data) => {
                    console.log("Sending offer to peer", peerId);
                    socket.emit('offer', peerId, JSON.stringify(data));
                });

                // Listen for the stream event
                peer.on('stream', (peerStream) => {
                    console.log("Received stream from peer", peerId);
                    setPeerStream(peerStream);
                });

                // Listen for the 'error' event
                peer.on('error', (error) => {
                    console.error("Peer error", error);
                });

                // Listen for the 'close' event
                peer.on('close', () => {
                    console.log("Peer connection closed");
                    peer.destroy();
                });

                // Listen for the socket 'answer' event
                socket.on('answer', (data) => {
                    console.log("Received answer from peer", peerId);
                    peer.signal(JSON.parse(data));
                });

                // Listen for the sockets 'stopCall' event
                socket.on('stopCall', () => {
                    console.log("Stopping call");
                    setPeerStream(null);
                    peer.destroy();
                });
            })

            // Listen for the incoming call event
            socket.on('incoming_call', ({ callerId }) => {
                console.log("Incoming call from", callerId);

                // Create a new peer connection
                const peer = new Peer({
                    initiator: false,
                    trickle: false,
                    stream: stream,
                });

                // Listen for the signal event
                peer.on('signal', (data) => {
                    console.log("Sending signal to caller", callerId);
                    socket.emit('answer', callerId, JSON.stringify(data));
                });

                // Listen for the stream event
                peer.on('stream', (peerStream) => {
                    console.log("Received stream from caller", callerId);
                    setPeerStream(peerStream);
                });

                // Listen for the 'error' event
                peer.on('error', (error) => {
                    console.error("Peer error", error);
                });

                // Listen for the 'close' event
                peer.on('close', () => {
                    console.log("Peer connection closed");
                    peer.destroy();
                });

                // Listen for the socket 'offer' event
                socket.on('offer', (data) => {
                    console.log("Received offer from caller", callerId);
                    peer.signal(JSON.parse(data));
                });

                // Listen for the sockets 'stopCall' event
                socket.on('stopCall', () => {
                    console.log("Stopping call");
                    setPeerStream(null);
                    peer.destroy();
                });

            })
        }
    }, [socket]);

    const handleSkip = () => {
        console.log("Skipping call");
        socket.emit('skip');
    }

    const handleStart = () => {
        console.log("Starting call");
        socket.emit('start');
    }

    const handleStop = () => {
        console.log("Stopping call");
        socket.emit('stop');
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
