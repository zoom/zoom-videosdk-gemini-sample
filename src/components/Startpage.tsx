import { useNavigate } from "react-router-dom";

const name = `Tester-${Math.floor(Math.random() * (999 - 100 + 1) + 100)}`;
const topic = 'TestOne';
const passcode = '';

const StartPage = () => {
  const navigate = useNavigate();

  const joinSession = async () => {
    const videoSDKJWT = prompt("Please enter your JWT for " + topic)?.trim();
    const geminiToken = prompt("Please enter your Gemini Token")?.trim();

    if (!videoSDKJWT || !geminiToken) {
      alert("JWT Token and Gemini Ephemeral Token is required for this application");
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

    navigate("/customuipage", { state: config });
  }

  return (
    <div className="flex flex-col items-center w-full h-screen self-center justify-center m-auto bg-gray-100">
      <h1 className="text-3xl">Zoom VideoSDK x Gemini Live API</h1>
      <button className="flex items-center justify-center cursor-pointer h-12 border-solid rounded-lg mt-2 bg-sky-500 w-1/4 text-white hover:bg-sky-600 active:bg-sky-700"
        type="button" onClick={joinSession}>Join Session</button>
    </div>
  );
}

export default StartPage;
