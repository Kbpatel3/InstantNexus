import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import TopBar from '../components/TopBar';
import VideoFeedContainer from '../components/VideoFeedContainer';
import MessageHistory from '../components/MessageHistory';
import MessageInput from '../components/MessageInput';

// Create a new socket.io client
const socket = io('http://localhost:5000');

// Test the connection
socket.on('connect', () => {
  alert('Connected to the server');
});

function DashboardPage() {
  return (
    <div className="w-screen h-screen m-0 grid grid-cols-6 grid-rows-8 gap-2">
      <div className="col-span-6">
        <TopBar />
      </div>
      <div className="col-span-6 row-span-4 row-start-2">
        <VideoFeedContainer />
      </div>
      <div className="col-span-6 row-span-2 row-start-6">
        <MessageHistory />
      </div>
      <div className="col-span-6 row-start-8">
        <MessageInput />
      </div>
    </div>
  );
}

export default DashboardPage;