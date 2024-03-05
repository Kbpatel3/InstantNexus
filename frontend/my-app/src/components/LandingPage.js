import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const LandingPage = () => {
    const [consent, setConsent] = useState(false);
    const history = useHistory();

    const handleConsentChange = (event) => {
        setConsent(event.target.checked);
    };

    const handleEnter = () => {
        if (consent) {
            history.push('/chat');
        } else {
            alert('Please agree to the terms and conditions.')
        }
    };

    return (
        <div>
            <h1>Welcome to InstantNexus</h1>
            <input type={"checkbox"} checked={consent} onChange={handleConsentChange} />
            <label>I agree to the terms and conditions</label>
            <br />
            <button onClick={handleEnter}>Start Matching</button>
        </div>
    );
};

export default LandingPage;