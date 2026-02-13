import React, { useState, useEffect, useRef } from "react";
import { BallTriangle } from "react-loader-spinner";
import "./GeminiAgent.css"
import { GoogleGenAI, Modality } from '@google/genai';
import { MediaRecorder } from 'extendable-media-recorder';
import { convertWebMToPCM, blobToBase64, playBase64Pcm } from "../../utils.ts";
import Draggable from 'react-draggable';
import { MdDragHandle } from "react-icons/md";
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";
import ChatBubble from "./ChatBubble.jsx";

const GeminiAgent = ({ muteZoomAudio, geminiToken }) => {
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [disableBtn, setDisableBtn] = useState(false);
    const [recorder, setRecorder] = useState(null);
    const [record, setRecord] = useState(false);
    const audioChunksRef = useRef([]);
    const [responseAudioString, setResponseAudioString] = useState("");
    const [responseMimeType, setResponseMimeType] = useState("");
    const [audioReady, setAudioReady] = useState(false);
    const [session, setSession] = useState(null);
    const [timeoutID, setTimeoutID] = useState("");
    const [transcriptBuffer, setTranscriptBuffer] = useState("");
    const [responseLog, setResponseLog] = useState([{id: 1, text: "Gemini Live API Ready!" }]);
    const nodeRef = useRef(null);
    const sessionRef = useRef(null);

    const displayToast = (message) => {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "bottom", 
            position: "left", 
            }).showToast();
    };

    const startResponseTimer = async () => {
        setTimeoutID(setTimeout(()=>{
            displayToast("Gemini response is taking longer than expected. Click to record again.");
            setProcessing(false);
            setDisableBtn(false);
        }, 7000));;
    };
    const playMicrophone = async () => {
        try {
                muteZoomAudio();
                const stream = await navigator.mediaDevices.getUserMedia({ audio: {
                    sampleRate: 48000, 
                    channelCount: 1,
                } });
                let mediaRecorder = new MediaRecorder(stream, {mimeType: 'audio/webm; codecs=opus'});

                mediaRecorder.addEventListener('dataavailable', event => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                });

                mediaRecorder.addEventListener('stop', async () => {
                    const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
                    const pcmBlob = await convertWebMToPCM(webmBlob);

                    session.sendRealtimeInput({
                        audio: {
                            data: await blobToBase64(pcmBlob),
                            mimeType: "audio/pcm;rate=48000"
                        }
                    })
                    audioChunksRef.current = [];
                }); 
                setRecorder(()=>mediaRecorder);

                mediaRecorder.start();
            } catch(err) {
                console.error(err);
            }
    };
    const initSession = async () => {
        const gemini = new GoogleGenAI({apiKey: geminiToken, httpOptions: { apiVersion: 'v1alpha' }});
        const model = 'gemini-2.5-flash-native-audio-preview-12-2025';
        const config = {
            responseModalities: [Modality.AUDIO],
            outputAudioTranscription: {},
            systemInstruction: "You are a helpful and friendly AI assistant.",
            speechConfig: {
                voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Orus'}},
            },
        };

        try {
            let startSession = await gemini.live.connect({
                model,
                config,
                callbacks: {
                    onopen: () => console.log('Connected to Gemini Live API'),
                    onmessage: (message) => {
                        if ('serverContent' in message) {
                            if ('modelTurn' in message.serverContent) {
                                const response = message.serverContent.modelTurn.parts[0];
                                if (response) {
                                    if ('inlineData' in response) {
                                        const {data, mimeType} = response.inlineData;
                                        setResponseAudioString(prev => prev + data);
                                        setResponseMimeType(mimeType);
                                    }
                                }
                            }
                            else if ('outputTranscription' in message.serverContent) {
                                setTranscriptBuffer(prevText => prevText + message.serverContent.outputTranscription.text);
                            }
                            else if ('generationComplete' in message.serverContent) {
                                const el = document.getElementById("chat-window");
                                if (el) el.scrollTop = el.scrollHeight;
                                setAudioReady(true);
                            }
                        }
                    },
                    onerror: (e) => {
                        console.error('Error', e.message);
                    },
                    onclose: (e) => {
                        console.error('Close:' + e.reason);
                    },
                },
            });
            setSession(()=>startSession);
            setLoading(false);
        } catch (e) {
           console.error(e);
        }
    };

    const toggleRecordingAudio = async () => {
        setAudioReady(false);
        if (!record) {
            await playMicrophone();
        } else {
            setProcessing(true);
            recorder.stop();
            setDisableBtn(true);
            startResponseTimer();
        }
        setRecord(!record);
    };

    useEffect(() => {
        sessionRef.current = session;
    }, [session]);

    useEffect(()=>{
        setTranscriptBuffer("");
    },[responseLog])

    useEffect(() => {
        initSession();
        displayToast("Click top of popup to drag");

        return () => {
            console.log("Closing Gemini Connection", sessionRef);
            sessionRef.current.close();
        };
    }, []);

    useEffect(() => {
        if (audioReady) {
            clearTimeout(timeoutID);
            playBase64Pcm(responseAudioString, responseMimeType);
            setResponseAudioString("");
            setResponseMimeType("");
            setProcessing(false);
            setDisableBtn(false);
            setResponseLog(prevResponses => [...prevResponses, {id: (prevResponses.length + 1).toString(), text: transcriptBuffer}]);
        }
    }, [audioReady]);

    return (
        <React.Fragment>
            <Draggable nodeRef={nodeRef} bounds="parent" handle=".handle" defaultPosition={{ x: (window.innerWidth / 2) - 175, y: 0 - (window.innerHeight / 2) }}>
            <div ref={nodeRef} className="flex justify-center items-center bg-[#F2EDE6]" style={{height:'400px', width:'350px', borderRadius: '20px', boxShadow: '0 0 10px #868585ff'}}>
                {loading && <BallTriangle height={100} width={100} radius={5} color="rgba(0, 150, 255, 1)" ariaLabel="ball-triangle-loading" wrapperClass={{}} wrapperStyle="" visible={true}/>}
                {!loading && 
                   <div style={{height:'100%', width:'100%'}}>

                        <div className="handle flex justify-center items-center" style={{ height: '5%', cursor: 'grab', backgroundColor: '#F2EDE6]', padding: '5px' }}>
                            <MdDragHandle />
                        </div>
                        <div id="chat-window" className="flex flex-col bg-[#ffffff]" style={{height:'80%', width:'100%', borderBottom: '2px solid #898989ff', overflow: 'scroll'}}>
                            {
                                responseLog.map(log => (
                                    <ChatBubble 
                                        key={log.id}
                                        message={log.text}/>
                                    ))
                            }
                        </div>
                        <div className="flex justify-evenly items-center" style={{height: '15%', width: '100%'}}>
                            <button style={{minWidth: '166px', width: 'fit-content'}} className="flex items-center justify-center h-12 border-solid rounded-lg bg-sky-600 w-1/2 text-white hover:bg-sky-700 active:bg-sky-800" type="button" disabled={disableBtn} onClick={toggleRecordingAudio}> 
                                {!processing 
                                    ? !record ? 'Click to Record' : 'Click to Stop' 
                                    : <div className="flex items-center">
                                        <BallTriangle height={35} width={35} radius={5} color="#fafafbff" ariaLabel="ball-triangle-loading" wrapperClass={{}} wrapperStyle="" visible={true}/> processing...
                                        </div>
                                }
                            </button> 
                        </div>
                    </div>
                }
            </div>
            </Draggable>
        </React.Fragment>
    );
}

export default GeminiAgent;