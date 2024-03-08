import React, { useState } from 'react';
/**
 * Landing Page component for the application
 * @returns {JSX.Element} JSX Element
 */
function LandingPage() {
    // State to keep track if the user accepted the terms and privacy policies
    const [accepted, setAccepted] = useState(false);

    // Function to handle the accept button click
    const handleButtonClick = () => {
        if (!accepted) {
            // Alert the user to accept the terms and privacy policies
            alert('Please accept the terms and privacy policies');
        } else {
            // Redirect the user to the dashboard
            window.location.href = '/dashboard';
        }
    }

    const handleCheckboxButton = () => {
        setAccepted(!accepted);
    }

    // JSX to render
    return (
        <div className={'h-screen flex items-center justify-center'}>
            <div className={'text-center'}>
                <h1 className={'m-4 text-5xl'}>Welcome to NexusLink</h1>
                <button className={"btn btn-primary btn-lg"} onClick={handleButtonClick}>Start Matching</button>
                <div className="m-4 flex justify-between items-center">
                    <label className="label cursor-pointer flex items-center">
                        <input type="checkbox" className="checkbox mr-2" onChange={handleCheckboxButton}/>
                        <span className="label-text">I agree with the terms and conditions</span>
                    </label>
                    <div className="flex items-center space-x-2">
                        <a href={"/terms"} className="link link-primary" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
                        <a href={"/privacy"} className="link link-primary" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;