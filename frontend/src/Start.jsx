import React from 'react';

export default function Start() {
    const logIn = () => window.location.replace('http://localhost:5000/auth/google');

    return (
        <div>
            <h1>EDUTRACK</h1>
            <button onClick={logIn}>Вход</button> 
        </div>
    )
}