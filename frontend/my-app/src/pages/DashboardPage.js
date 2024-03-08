import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Create a new socket.io client
const socket = io('http://localhost:5000');

// Test the connection
socket.on('connect', () => {
  alert('Connected to the server');
});

function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}

export default DashboardPage;