import { useState } from "react";
import { BallTriangle } from "react-loader-spinner";
import { FiMicOff, FiMic } from "react-icons/fi";
import { GoMute } from "react-icons/go";
import { IoVideocamOutline, IoVideocamOffOutline } from "react-icons/io5";
import { RiGeminiLine } from "react-icons/ri";
import "./Controls.css";
import ZoomVideo, { VideoQuality } from "@zoom/videosdk";


interface ControlsProps {
  client: ReturnType<typeof ZoomVideo.createClient>
  toggleGemini: () => void;
  leaveSession: () => void;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
}

const Controls = ({ client, toggleGemini, leaveSession, isMuted, setIsMuted }: ControlsProps) => {
  const stream = client.getMediaStream();
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [videoLoader, setVideoLoader] = useState(false);
  const [isAudioStarted, setIsAudioStarted] = useState(false);

  const startMyVideo = async () => {
    const currentUser = client.getCurrentUserInfo();
    setVideoLoader(true);
    console.log("attaching current user video to the DOM")
    const stream = client.getMediaStream();
    await stream.startVideo({
    });
    let userVideo = await stream.attachVideo(currentUser.userId, VideoQuality.Video_720P);
    if (userVideo) {
      let el = document.getElementById(String(currentUser.userId));
      if (el) el.replaceChildren();
      if (el) el.appendChild(userVideo as unknown as Node);
      setIsVideoOn(true);
      setVideoLoader(false);
    }
  };

  const stopMyVideo = async () => {
    const currentUser = client.getCurrentUserInfo();
    setVideoLoader(true);
    const stream = client.getMediaStream();
    console.log("removing current user video from the DOM")
    await stream.stopVideo();
    stream.detachVideo(currentUser.userId);
    let el = document.getElementById(String(currentUser.userId));
    const noVidDiv = document.createElement("div");
    noVidDiv.id = currentUser.userId + '-video-off';
    noVidDiv.className = 'video-off';
    noVidDiv.innerHTML = "<h2>" + currentUser.displayName + "</h2>";
    if (el) el.replaceChildren();
    if (el) el.appendChild(noVidDiv);
    setIsVideoOn(false);
    setVideoLoader(false)
  };

  const startAudio = async () => {
    const audioEnabled = await client.getCurrentUserInfo().audio;
    const stream = client.getMediaStream();
    if (!audioEnabled) {
      await stream.startAudio({});
    }
    const curr = await client.getCurrentUserInfo();
    setIsAudioStarted(curr.audio ? true : false);
    setIsMuted(curr.muted ?? false);
  };

  const toggleAudio = async () => {
    const stream = client.getMediaStream();
    (await client.getCurrentUserInfo().muted) ? await stream.unmuteAudio() : await stream.muteAudio();
    const curr = await client.getCurrentUserInfo();
    setIsMuted(curr.muted ?? false);
  };


  const toggleVideo = () => {
    if (client.getCurrentUserInfo().bVideoOn) stopMyVideo();
    else startMyVideo();
  };

  if (!client && !stream) {
    return (
      <div className="flex items-center w-48 m-auto mt-96">
        <BallTriangle height={200} width={200} radius={5} color="#0096FF" ariaLabel="ball-triangle-loading" visible={true} />
      </div>
    );
  } else {
    return (
      <div className="ctrl-btn-container">
        <button className="ctrl-btn items-center justify-center h-12 border-solid rounded-lg mt-2 bg-sky-500 w-1/2 text-white hover:bg-sky-700 active:bg-sky-800"
          type="button"
          onClick={toggleVideo}
          disabled={false}> {videoLoader
            ? <BallTriangle height={30} width={30} radius={5} color="#eef1f4ff" ariaLabel="ball-triangle-loading" visible={true} />
            : isVideoOn ? <IoVideocamOutline size={30} /> : <IoVideocamOffOutline size={30} />
          }
        </button>

        {!isAudioStarted
          ? <button className="ctrl-btn items-center justify-center h-12 border-solid rounded-lg mt-2 bg-sky-500 w-1/2 text-white hover:bg-sky-700 active:bg-sky-800"
            type="button"
            onClick={startAudio}
            disabled={false}> <GoMute size={30} />
          </button>
          : <button className="ctrl-btn items-center justify-center h-12 border-solid rounded-lg mt-2 bg-sky-500 w-1/2 text-white hover:bg-sky-700 active:bg-sky-800"
            type="button"
            onClick={toggleAudio}
            disabled={false}> {isMuted ? <FiMicOff size={30} /> : <FiMic size={30} />}
          </button>
        }

        {<button className="ctrl-btn items-center justify-center h-12 border-solid rounded-lg mt-2 bg-sky-500 w-1/2 text-white hover:bg-sky-700 active:bg-sky-800"
          type="button"
          onClick={toggleGemini}
          disabled={false}> <div className="flex items-center"> <RiGeminiLine /> <span style={{ marginLeft: '5px' }}>Gemini</span> </div>
        </button>}

        <button className="text-white bg-red-600 hover:bg-red-700 active:bg-red-800 border-solid rounded-lg mt-2"
          type="button"
          onClick={leaveSession}
          disabled={false}> Leave Session
        </button>
      </div>
    );
  }
};

export default Controls;
