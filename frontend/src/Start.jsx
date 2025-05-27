import React from 'react';

export default function Start() {
    const logIn = () => window.location.replace('http://localhost:5000/auth/google');

    return (
        <div class="flex flex-col items-center justify-center h-screen w-screen">
            <h1 class="font-black text-[#78ACCA] text-[64px]">EDUTRACK</h1>
            <button onClick={logIn} class="mt-[20px] bg-[#EE6C4D] text-white w-[150px] h-[30px] rounded-full">Вход</button> 
        </div>
    )
}