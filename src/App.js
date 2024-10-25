import React, { useState, useEffect } from 'react';
import WebPlayback from './WebPlayback'
import Login from './Login'
import './App.css';

function App() {

  const [token, setToken] = useState('');
  const [playlistID, setPlaylistID] = useState('1fMkI1ZT6gBkVgW3T3s3YM')

  useEffect(() => {

    async function getToken() {
      const response = await fetch('/auth/token');
      const json = await response.json();
      setToken(json.access_token);
    }

    getToken();

  }, []);

  return (
    <>
      {(token === '') ? <Login /> : <WebPlayback token={token} playlistId={playlistID} setPlaylistId={setPlaylistID} />}
    </>
  );
}

export default App;
