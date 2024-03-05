import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ChatRoom from './components/ChatRoom';

function App() {
  return (
      <Router>
        <Switch>
          <Route path="/" exact component={LandingPage} />
          <Route path="/chat" component={ChatRoom} />
        </Switch>
      </Router>
  )
}

export default App;