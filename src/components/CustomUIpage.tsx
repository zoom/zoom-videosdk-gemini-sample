import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Circles } from "react-loader-spinner";
import ZoomVideo from "@zoom/videosdk";
import GeminiAgent from "./gemini-agent/GeminiAgent";
import Video from "./features/Video";
import Controls from "./features/Controls";

interface MeetingConfig {
  sessionName: string;
  videoSDKJWT: string;
  userName: string;
  sessionPasscode: string;
  geminiToken: string;
}

interface ConnectionPayload {
  state: string;
  reason?: string;
}

const CustomUIpage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loader, setLoader] = useState(true);
  const client = ZoomVideo.createClient();
  const [showGemini, setShowGemini] = useState(false);
  const [geminiToken, setGeminiToken] = useState('');

  const [isMuted, setIsMuted] = useState(false);
  const userAdded = (payload: any[]) => {
    console.log(payload[0].userId + ' joined the session');
  };
  const userRemoved = (payload: any[]) => {
    console.log(payload[0].userId + ' left the session');
  };

  const connectionChange = (payload: ConnectionPayload) => {
    const currentUser = client.getCurrentUserInfo();
    console.log("FROM CONNECTION CHANGE", payload.state, payload.reason ?? "");
    if (payload.state === 'Closed') {
      if (client && !currentUser.isHost) leaveSession();
    } else if (payload.state === 'Reconnecting') {
      setLoader(true);
    } else if (payload.state === 'Connected') {
      setLoader(false);
    } else if (payload.state === 'Fail') {
      leaveSession();
    }
  };

  const toggleGemini = () => {
    setShowGemini(!showGemini);
  };

  const joinMeeting = async (config: MeetingConfig) => {
    await client.init('en-US', 'Global', {
      patchJsMedia: true,
      stayAwake: true,
      leaveOnPageUnload: true,
    });
    //configure listeners
    console.log('Adding Listeners');
    client.on('user-added', userAdded);
    client.on('user-removed', userRemoved);
    client.on('connection-change', connectionChange);
    await client.join(config.sessionName, config.videoSDKJWT, config.userName, config.sessionPasscode);
    //Set Session State
    setGeminiToken(config.geminiToken)
    setLoader(false);
  };

  const cleanup = () => {
    console.log("removing listeners");
    client.off('user-added', userAdded);
    client.off('user-removed', userRemoved);
    client.off('connection-change', connectionChange);
  };
  const leaveSession = async () => {
    cleanup();
    await client.leave();
    navigate("/startpage");
  };
  const muteAudio = async () => {
    const stream = client.getMediaStream();
    const curr = await client.getCurrentUserInfo();
    if (curr.audio) {
      await stream.muteAudio();
      setIsMuted(true);
    } else {
      // setIsAudioStarted(false);
    }
  };

  useEffect(() => {
    console.log('Joining Meeting', location.state);
    if (location.state) {
      console.log('Joining Meeting');
      joinMeeting(location.state);
    } else {
      console.error("No config object passed. Going back to /startpage")
      navigate("/startpage");
    }
  }, []);

  if (loader) {
    return (
      <div className="flex items-center w-48 m-auto mt-96">
        <Circles height={200} width={200} color="#0096FF" ariaLabel="ball-triangle-loading" visible={true} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-100">
      <div className="flex flex-col items-center justify-center flex-1">
        <Video client={client} />
        <Controls
          setIsMuted={setIsMuted}
          isMuted={isMuted}
          client={client}
          toggleGemini={toggleGemini}
          leaveSession={leaveSession}
        />
      </div>
      {showGemini && <GeminiAgent muteZoomAudio={muteAudio} geminiToken={geminiToken} />}
    </div>
  );
}

export default CustomUIpage;
