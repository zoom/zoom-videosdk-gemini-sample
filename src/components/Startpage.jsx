import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const name = `Tester-${Math.floor(Math.random() * (999 - 100 + 1) + 100)}`;
const topic = 'TestOne';
const passcode = '';

const StartPage = () => {
  const navigate = useNavigate();

  const joinSession = async () => {
    const videoSDKJWT = prompt("Please enter your JWT for " + topic);
    const geminiToken = prompt("Please enter your Gemini Token");

    if (!videoSDKJWT || !geminiToken) {
      alert("JWT Token and Gemini Ephemeral Token is required for this application");
      return;
    }

    if (name === "" || topic === "") {
      alert("Name and topic are required");
      return;
    }

    let config = {
      videoSDKJWT,
      geminiToken,
      sessionName: topic,
      userName: name,
      sessionPasscode: passcode,
      sessionIdleTimeoutMins: 40,
      debug: true,
    };

    console.log("Session Config", { config })

    navigate("/customuipage", { state: config });
  }

  return (
    <div className="flex flex-col items-center w-96 mt-96 m-auto" style={{ width: "25rem" }}>
      <h1 className="text-3xl">VideoSDK x Gemini Live API</h1>
      <button className="flex items-center justify-center h-12 border-solid rounded-lg mt-2 bg-sky-600 w-1/2 text-white hover:bg-sky-700 active:bg-sky-800" type="button" onClick={joinSession}>Join Session</button>
    </div>
  );
}

export default StartPage;
