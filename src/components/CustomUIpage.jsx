import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BallTriangle } from "react-loader-spinner";
import ZoomVideo, { VideoQuality } from "@zoom/videosdk";
import { CurrentUser } from "./context/CurrentUserContext";
import GeminiAgent from "./gemini-agent/GeminiAgent";
import Video from "./features/Video";
import Controls from "./features/Controls";
import './CustomUIpage.css'

const CustomUIpage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser, setCurrentUser } = CurrentUser();

  const [loader, setLoader] = useState(true);
  const [client, setClient] = useState();
  const [stream, setStream] = useState();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [videoLoader, setVideoLoader] = useState(false);
  const [isAudioStarted, setIsAudioStarted] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [geminiToken, setGeminiToken] = useState('');

  const userAdded = (payload) => {
    console.log(payload[0].userId + ' joined the session');
  };
  const userRemoved = (payload) => {
    console.log(payload[0].userId + ' left the session');
  };

  const connectionChange = (payload) => {
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

  const startMyVideo = async () => {
    setVideoLoader(true);
    console.log("attaching current user video to the DOM")
    let cameras = stream.getCameraList();
    let cameraId = (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) ? 'user' : cameras[0]?.cameraId;

    await stream.startVideo({
      cameraId,
      originalRatio: true,
    });
    let userVideo = await stream.attachVideo(currentUser.userId, VideoQuality.Video_720P);
    let el = document.getElementById(currentUser.userId);
    el.replaceChildren();
    el.appendChild(userVideo);
    setIsVideoOn(true);
    setVideoLoader(false);
  };

  const stopMyVideo = async () => {
    setVideoLoader(true);
    console.log("removing current user video from the DOM")
    await stream.stopVideo();
    stream.detachVideo(currentUser.userId);
    let el = document.getElementById(currentUser.userId);
    const noVidDiv = document.createElement("div");
    noVidDiv.id = currentUser.userId + '-video-off';
    noVidDiv.className = 'video-off';
    noVidDiv.innerHTML = "<h2>" + currentUser.displayName + "</h2>";
    el.replaceChildren();
    el.appendChild(noVidDiv);
    setIsVideoOn(false);
    setVideoLoader(false)
  };

  const startAudio = async () => {
    const audioEnabled = await client.getCurrentUserInfo().audio;

    if (!audioEnabled) {
      const micId = stream.getMicList();
      const speakerId = stream.getSpeakerList();

      console.log("MIC!", micId, speakerId);

      await stream.startAudio({
        backgroundNoiseSuppression: true,
        mute: true,
        originalSound: true
      });
    }
    const curr = await client.getCurrentUserInfo();
    setIsAudioStarted(curr.audio ? true : false);
    setIsMuted(curr.muted);
  };

  const disconnectAudio = async () => {
    stream.stopAudio();
    setIsAudioStarted(false);
  };

  const toggleAudio = async () => {
    (await client.getCurrentUserInfo().muted) ? await stream.unmuteAudio() : await stream.muteAudio();
    const curr = await client.getCurrentUserInfo();
    setIsMuted(curr.muted);
  };

  const muteAudio = async () => {
    const curr = await client.getCurrentUserInfo();
    if (curr.audio) {
      await stream.muteAudio();
      setIsMuted(true);
    } else {
      setIsAudioStarted(false);
    }
  };

  const toggleGemini = () => {
    setShowGemini(!showGemini);
  };

  const joinMeeting = async (config) => {

    //init and join Zoom SDK
    let zoomClient = ZoomVideo.createClient();

    await zoomClient.init('en-US', 'Global', {
      patchJsMedia: true,
      stayAwake: true,
      leaveOnPageUnload: true,
    });
    await zoomClient.join(config.sessionName, config.videoSDKJWT, config.userName, config.sessionPasscode);
    let zoomStream = zoomClient.getMediaStream();

    console.log('Meeting Joined');

    //configure listeners
    console.log('Adding Listeners');
    zoomClient.on('user-added', userAdded);
    zoomClient.on('user-removed', userRemoved);
    zoomClient.on('connection-change', connectionChange);

    //Set Session State
    setClient(zoomClient);
    setStream(zoomStream);
    setGeminiToken(config.geminiToken)
    setCurrentUser(zoomClient.getCurrentUserInfo());
    setLoader(loader => !loader);
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
  const endSession = async () => {
    cleanup();
    await client.leave(true);
    navigate("/startpage");
  };

  useEffect(() => {
    if (location.state) {
      console.log('Joining Meeting', location.state);
      joinMeeting(location.state);
    } else {
      console.error("No config object passed. Going back to /startpage")
      navigate("/startpage");
    }
  }, []);

  if (loader) {
    return (
      <div className="flex items-center w-48 m-auto mt-96">
        <BallTriangle height={200} width={200} radius={5} color="#0096FF" ariaLabel="ball-triangle-loading" wrapperClass={{}} wrapperStyle="" visible={true} />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <div className="vsdk-container">
        <Video client={client} stream={stream} />
        <Controls
          client={client}
          stream={stream}
          videoLoader={videoLoader}
          startMyVideo={startMyVideo}
          stopMyVideo={stopMyVideo}
          isVideoOn={isVideoOn}
          toggleAudio={toggleAudio}
          isAudioStarted={isAudioStarted}
          isMuted={isMuted}
          disconnectAudio={disconnectAudio}
          toggleGemini={toggleGemini}
          startAudio={startAudio}
          leaveSession={leaveSession}
          endSession={endSession} />
      </div>
      {showGemini && <GeminiAgent muteZoomAudio={muteAudio} geminiToken={geminiToken} />}
    </div>
  );
}

export default CustomUIpage;