import React, { useState, useEffect } from "react";

const initialTrack = {
  name: "",
  album: {
    images: [{ url: "" }],
  },
  artists: [{ name: "" }],
};

function WebPlayback({ token, playlistId, setPlaylistId }) {
  const [isPaused, setPaused] = useState(false);
  const [isActive, setActive] = useState(false);
  const [player, setPlayer] = useState(undefined);
  const [currentTrack, setCurrentTrack] = useState(initialTrack);
  const [playlistMetaData, setPlaylistMetaData] = useState({
    name: "",
    owner: "",
  });
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [deviceID, setDeviceID] = useState("");
  const [customPlaylist, setCustomPlaylist] = useState("");

  useEffect(() => {
    // Load Spotify SDK
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const now = new Date();
      const player = new window.Spotify.Player({
        name: `Composer POC ${now.getHours()}:${now.getMinutes()} ${now.getSeconds()}`,
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: 0.5,
      });

      setPlayer(player);

      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setDeviceID(device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) return;
        setCurrentTrack(state.track_window.current_track);
        setPaused(state.paused);

        player.getCurrentState().then((state) => {
          setActive(!!state);
        });
      });

      player.connect();
    };
  }, [token]);

  // Fetch playlist
  useEffect(() => {
    if (!playlistId) return;

    const fetchPlaylistTracks = async () => {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        console.error("Token expired, redirecting to login");
        window.location.href = "/auth/login";
      }

      const data = await response.json();
      setPlaylistTracks(data.tracks.items);
      setPlaylistMetaData({ name: data.name, owner: data.owner.display_name });
    };

    fetchPlaylistTracks();
  }, [playlistId, token]);

  // Function to play selected track
  const playTrack = async (offset) => {
    if (!player) return;

    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceID}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context_uri: `spotify:playlist:${playlistId}`,
          offset: { position: offset },
        }),
      }
    );

    if (response.status === 401) {
      console.error("Token expired. redirecting to login");
      window.location.href = "/auth/login";
    }
  };

  return (
    <div>
      <div className="main-wrapper">
        <div className="now-playing sticky" style={{}}>
          {isActive ? (
            <>
              <img
                src={currentTrack.album.images[0]?.url}
                className="now-playing__cover"
                alt=""
              />
              <div className="now-playing__side">
                <div className="now-playing__name">{currentTrack.name}</div>
                <div className="now-playing__artist">
                  {currentTrack.artists[0].name}
                </div>

                <button onClick={() => player.previousTrack()}>&lt;&lt;</button>
                <button onClick={() => player.togglePlay()}>
                  {isPaused ? "PLAY" : "PAUSE"}
                </button>
                <button onClick={() => player.nextTrack()}>&gt;&gt;</button>
              </div>
            </>
          ) : (
            <div style={{ marginTop: 100 }}>
              <h1 style={{ color: "white" }}>Composer POC</h1>
              <h2 style={{ color: "white" }}>
                Tap on any track to start playback.
              </h2>
            </div>
          )}
        </div>

        <div
          style={{
            backgroundColor: "#333",
            padding: "8px 0 8px 16px",
            position: "fixed",
            top: 300,
            width: "100%",
          }}
        >
          <input
            type="text"
            placeholder="paste a Spotify playlist URL here"
            style={{ width: "500px" }}
            onChange={(e) => {
              setCustomPlaylist(e.target.value);
              // Extract playlist ID from URL
              const url = new URL(e.target.value);
              setPlaylistId(url.pathname.split("/").pop());
            }}
            value={customPlaylist}
          />
          <h3 style={{ color: "#44c767" }}>
            Playlist: {playlistMetaData.name} by {playlistMetaData.owner}
          </h3>
        </div>
      </div>

      <div className="playlist">
        {playlistTracks.map((trackItem, index) => (
          <div
            key={index}
            className="playlist-track"
            onClick={() => playTrack(index)}
          >
            <img
              src={trackItem.track.album.images[0]?.url}
              className="album-cover"
              alt="album cover"
            />
            <div className="track-info">
              <div className="track-name">{trackItem.track.name}</div>
              <div className="track-artist">
                {trackItem.track.artists[0].name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WebPlayback;
