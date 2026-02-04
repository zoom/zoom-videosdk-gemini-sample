import React from 'react';
import StartPage from "./components/Startpage";
import MeetingsPage from "./components/Meetingspage";
import CustomUIPage from './components/CustomUIpage';
import CurrentUserContextProvider from './components/context/CurrentUserContext';

import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
  } from "react-router-dom";

const App = () => {
    return (
        <React.Fragment>
        <Router>
        <CurrentUserContextProvider>
          <Routes>
            <Route path="/" element={<Navigate replace to="/startpage" />} />
            <Route path="/startpage" element={<StartPage />} />
            <Route path="/meetingspage" element={<MeetingsPage />} />
            <Route path="/customuipage" element={<CustomUIPage />} />
          </Routes>
          </CurrentUserContextProvider>
        </Router>
        
    </React.Fragment>
    )
}

export default App
