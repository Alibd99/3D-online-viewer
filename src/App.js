import React, { useState } from 'react';
import './App.css';
import IntroRoute from './components/IntroRoute';
import LoggedChatRoute from './components/LoggedChatRoute';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

function App() {  
    return (
        <Router>
          <div className="App">
            <Switch>
              <Route path="/intro">
                <IntroRoute />
              </Route>
              <Route path="/chat">
                 {/* Ensure LoggedChatRoute is rendered only once */}
                <LoggedChatRoute />
              </Route>
              {/* Redirect to /intro by default */}
              <Redirect from="/" to="/intro" />
            </Switch>
          </div>
        </Router>
      );
  }  

export default App;
