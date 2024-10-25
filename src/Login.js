import React from 'react';

function Login() {
    return (
        <div className="App">
            <header className="App-header">
                <button onClick={() => window.location.href = "/auth/login"}>
                    Login with Spotify
                </button>
                {/* <a className="btn-spotify" href="/auth/login" >
                </a> */}
            </header>
        </div>
    );
}

export default Login;

