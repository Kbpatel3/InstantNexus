import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import './styles.css';
import SocketContext from "./context/SocketContext";
import { io } from "socket.io-client";

// Make a connection to the server
const socket = io.connect("https://192.168.1.27:5000");

/**
 * App component that contains the routes for the application
 * @returns {JSX.Element} JSX Element
 */
function App() {
    // Routes for the application
    return (
        <SocketContext.Provider value={socket}>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                </Routes>
            </Router>
        </SocketContext.Provider>
    );
}

export default App;