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
        }
    }

    // JSX to render
    return (
        <div className={'h-screen flex items-center justify-center'}>
            <div className={'text-center'}>
                <h1 className={'m-4 text-5xl'}>Welcome to NexusLink</h1>
                <button className={"btn btn-primary btn-lg"} onClick={handleButtonClick}>Start Matching</button>
                <div className="form-control m-4">
                    <label className="label cursor-pointer">
                        <span className="label-text">I agree with the terms and conditions</span>
                        <input type="checkbox" className="checkbox"/>
                    </label>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;