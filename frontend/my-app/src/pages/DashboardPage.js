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
    <div className="grid grid-cols-1 md:grid-cols-10 p-2 gap-2">
      <div className="col-span-full">
        <TopBar />
      </div>
      <div className="col-span-full md:row-span-3 lg:row-span-2">
        <VideoFeedContainer />
      </div>
      <div className="col-span-full md:row-span-2">
        <MessageHistory />
      </div>
      <div className="col-span-full">
        <MessageInput />
      </div>
    </div>
  );
}


export default DashboardPage;