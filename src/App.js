import './App.css';
import Spotify from './components/Spotify';

import React from 'react';

function App() {
  return (
    <div>
      <div className="App">
        <a href="http://localhost:8888/login">Login!</a>
        <Spotify />
      </div>
    </div>
  );
}

export default App;
