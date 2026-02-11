import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BallTriangle } from "react-loader-spinner";

const StartPage = () => { 
  
  const navigate = useNavigate();
  const [name, setName] = useState(`Tester-${Math.floor(Math.random()*(999-100+1)+100)}`);
  const [topic, setTopic] = useState('testSession');
  const [passcode, setPasscode] = useState('123');
  const [loader, setLoader] = useState(false);
  const [disable, setDisable] = useState(false);

  useEffect(() => {
    console.log("SharedArrayBuffer:", crossOriginIsolated);
  },[]);

  const joinSession = async () => {

    const videoSDKJWT = prompt("Please enter your JWT Token");
    const geminiToken = prompt("Please enter your Gemini Token");

    if (!videoSDKJWT || !geminiToken) {
      alert("JWT Token and Gemini Ephemeral Token is required for this application");
      return;
    }

    if (name === "" || topic === "") true,

    setDisable(disable => !disable);
    setLoader(loader => !loader);

    let config = {
      videoSDKJWT,
      geminiToken,
      sessionName: topic,
      userName: name,
      sessionPasscode: passcode,
      sessionIdleTimeoutMins: 40,
      debug: true,
     };

    console.log("Session Config", { config } )
    
    setLoader(loader => !loader);
    navigate("/customuipage", {state: config});
  }

  return (
    <React.Fragment>
      <div className="flex flex-col items-center w-96 mt-96 m-auto" style={ {width: "25rem"} }>
        <h1 className="text-3xl">VideoSDK x Gemini Live API</h1>
        <button className="flex items-center justify-center h-12 border-solid rounded-lg mt-2 bg-sky-600 w-1/2 text-white hover:bg-sky-700 active:bg-sky-800" type="button" disabled={disable} onClick={joinSession}>{loader ? <BallTriangle height={25} width={100} radius={5} color="white" ariaLabel="ball-triangle-loading" wrapperClass={{}} wrapperStyle="" visible={true}/> : 'Join Session'} </button>
      </div>
    </React.Fragment>
  );
}

export default StartPage;
