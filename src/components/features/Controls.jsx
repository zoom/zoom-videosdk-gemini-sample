import React, { useEffect} from "react";
import { BallTriangle } from "react-loader-spinner";
import { FiMicOff } from "react-icons/fi";
import { FiMic } from "react-icons/fi";
import { GoMute } from "react-icons/go";
import { IoVideocamOutline } from "react-icons/io5";
import { IoVideocamOffOutline } from "react-icons/io5";
import { CgClose } from "react-icons/cg";
import { RiGeminiLine } from "react-icons/ri";
import Popup from 'reactjs-popup';
import { CurrentUser } from "../context/CurrentUserContext";
import "./Controls.css";


const Controls = ({ client, stream, videoLoader, startMyVideo, stopMyVideo, isVideoOn, isAudioStarted, isMuted, toggleAudio, toggleGemini, disconnectAudio, startAudio, leaveSession, endSession }) => {

    const { currentUser } = CurrentUser();

    const toggleVideo = () => {
      console.log(isVideoOn);
        if (client.getCurrentUserInfo().bVideoOn) stopMyVideo();
        else startMyVideo();
    }; 

    useEffect(() => {}, []);

    if (!client && !stream) {
        return (
            <React.Fragment>
              <div className="flex items-center w-48 m-auto mt-96">
               <BallTriangle  height={200} width={200} radius={5} color="#0096FF" ariaLabel="ball-triangle-loading" wrapperClass={{}} wrapperStyle="" visible={true}/>
              </div>
            </React.Fragment>
          );
    } else {
        return (
            <React.Fragment>
              <div className="ctrl-btn-container">
                <button className="ctrl-btn items-center justify-center h-12 border-solid rounded-lg mt-2 bg-sky-600 w-1/2 text-white hover:bg-sky-700 active:bg-sky-800" 
                   type="button" 
                   onClick={toggleVideo}
                   disabled={false}> { videoLoader 
                    ? <BallTriangle  height={30} width={30} radius={5} color="#eef1f4ff" ariaLabel="ball-triangle-loading" wrapperClass={{}} wrapperStyle="" visible={true}/>
                    : isVideoOn ? <IoVideocamOutline size={30}/> : <IoVideocamOffOutline size={30}/>
                    }
                </button>
                
                 {!isAudioStarted 
                   ? <button className="ctrl-btn items-center justify-center h-12 border-solid rounded-lg mt-2 bg-sky-600 w-1/2 text-white hover:bg-sky-700 active:bg-sky-800" 
                    type="button" 
                    onClick={startAudio}
                    disabled={false}> <GoMute size={30}/>
                    </button> 
                   : <button className="ctrl-btn items-center justify-center h-12 border-solid rounded-lg mt-2 bg-sky-600 w-1/2 text-white hover:bg-sky-700 active:bg-sky-800" 
                      type="button" 
                      onClick={toggleAudio}
                      disabled={false}> {isMuted ? <FiMicOff size={30}/> : <FiMic size={30}/>}
                      </button> 
                      }

                {isAudioStarted && 
                      <button className="ctrl-btn items-center justify-center h-12 border-solid rounded-lg mt-2 bg-sky-600 w-1/2 text-white hover:bg-sky-700 active:bg-sky-800" 
                      type="button" 
                      onClick={disconnectAudio}
                      disabled={false}> Disconnect Audio
                      </button> }
                

                {<button className="ctrl-btn items-center justify-center h-12 border-solid rounded-lg mt-2 bg-sky-600 w-1/2 text-white hover:bg-sky-700 active:bg-sky-800" 
                   type="button" 
                   onClick={toggleGemini}
                   disabled={false}> <div className="flex items-center"> <RiGeminiLine /> <span style={{marginLeft: '5px'}}>Gemini</span> </div>
                </button>}

                  <Popup 
                    trigger={<button className="ctrl-btn items-center justify-center h-12 border-solid rounded-lg mt-2 bg-red-600 w-1/2 text-white hover:bg-red-700 active:bg-red-800" 
                      type="button"> <CgClose size={30}/>
                      </button>} 
                    position="top center">
                      <div style={{width: '165px', height: '50px', borderRadius: '14px', overflow: 'hidden'}} className="flex flex-col">
                        <button style={{borderBottom: 'solid 2px #494141'}} className="text-white bg-red-600 hover:bg-red-700 active:bg-red-800" 
                          type="button" 
                          onClick={leaveSession}
                          disabled={false}> Leave Session
                        </button>
                        {currentUser.isHost && <button className="text-white bg-red-600 hover:bg-red-700 active:bg-red-800" 
                          type="button" 
                          onClick={endSession}
                          disabled={false}> End Session
                         </button>}
                      </div>
                </Popup>

                
              </div>
            </React.Fragment>
          );
    }
};

export default Controls;