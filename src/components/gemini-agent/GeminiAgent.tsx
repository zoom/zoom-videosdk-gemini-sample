import { useState, useEffect, useRef } from "react";
import { BallTriangle } from "react-loader-spinner";
import { GoogleGenAI, Modality, Session } from '@google/genai';
import { MediaRecorder, IMediaRecorder } from 'extendable-media-recorder';
import { convertWebMToPCM, blobToBase64, playBase64Pcm } from "../../utils.ts";
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";
import ChatBubble from "./ChatBubble.tsx";

interface GeminiAgentProps {
    muteZoomAudio: () => void;
    geminiToken: string;
}

const GeminiAgent = ({ muteZoomAudio, geminiToken }: GeminiAgentProps) => {
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [disableBtn, setDisableBtn] = useState(false);
    const [recorder, setRecorder] = useState<IMediaRecorder | null>(null);
    const [record, setRecord] = useState(false);
    const audioChunksRef = useRef<Blob[]>([]);
    const [responseAudioString, setResponseAudioString] = useState("");
    const [responseMimeType, setResponseMimeType] = useState("");
    const [audioReady, setAudioReady] = useState(false);
    const [timeoutID, setTimeoutID] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [transcriptBuffer, setTranscriptBuffer] = useState("");
    const [responseLog, setResponseLog] = useState([{ id: 1, text: "Gemini Live API Ready!" }]);
    const sessionRef = useRef<Session | null>(null);

    const displayToast = (message: string) => {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "bottom",
            position: "left",
        }).showToast();
    };

    const startResponseTimer = async () => {
        setTimeoutID(setTimeout(() => {
            displayToast("Gemini response is taking longer than expected. Click to record again.");
            setProcessing(false);
            setDisableBtn(false);
        }, 15000));
    };
    const playMicrophone = async () => {
        try {
            muteZoomAudio();
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 48000,
                    channelCount: 1,
                }
            });
            let mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm; codecs=opus' });

            mediaRecorder.addEventListener('dataavailable', event => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            });

            mediaRecorder.addEventListener('stop', async () => {
                try {
                    const currentSession = sessionRef.current;
                    if (!currentSession) {
                        console.error("No active Gemini session");
                        return;
                    }
                    const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
                    const pcmBlob = await convertWebMToPCM(webmBlob);
                    const base64Audio = await blobToBase64(pcmBlob) as string;

                    currentSession.sendRealtimeInput({ activityStart: {} });
                    currentSession.sendRealtimeInput({
                        // audio: {
                        //     data: base64Audio,
                        //     mimeType: "audio/pcm;rate=48000"
                        // }
                        text: "what is the weather like in Lawrenceville, GA today?"
                    });
                    currentSession.sendRealtimeInput({ activityEnd: {} });
                    audioChunksRef.current = [];
                } catch (err) {
                    console.error("Error sending audio to Gemini:", err);
                }
            });
            setRecorder(mediaRecorder);

            mediaRecorder.start();
        } catch (err) {
            console.error(err);
        }
    };
    const initSession = async () => {
        const gemini = new GoogleGenAI({ apiKey: geminiToken, httpOptions: { apiVersion: 'v1alpha' } });
        const model = 'gemini-2.5-flash-native-audio-preview-12-2025';
        const config = {
            responseModalities: [Modality.AUDIO],
            outputAudioTranscription: {},
            systemInstruction: "You are a helpful and friendly AI assistant.",
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } },
            },
            realtimeInputConfig: {
                automaticActivityDetection: { disabled: true },
            },
        };

        try {
            let startSession = await gemini.live.connect({
                model,
                config,
                callbacks: {
                    onopen: () => console.log('Connected to Gemini Live API'),
                    onmessage: (message) => {
                        const serverContent = message?.serverContent;
                        if (!serverContent) return;

                        if (serverContent?.modelTurn?.parts && Array.isArray(serverContent.modelTurn.parts)) {
                            const response = serverContent.modelTurn.parts[0];
                            if (response && "inlineData" in response && response.inlineData) {
                                const { data, mimeType } = response.inlineData as { data?: string, mimeType?: string };
                                if (typeof data === "string") {
                                    setResponseAudioString(prev => prev + data);
                                }
                                if (typeof mimeType === "string") {
                                    setResponseMimeType(mimeType);
                                }
                            }
                        } else if (serverContent?.outputTranscription?.text) {
                            setTranscriptBuffer(
                                prevText => prevText + (serverContent.outputTranscription?.text ?? "")
                            );
                        } else if ("generationComplete" in serverContent) {
                            const el = document.getElementById("chat-window");
                            if (el) el.scrollTop = el.scrollHeight;
                            setAudioReady(true);
                        }
                    },
                    onerror: (e) => {
                        console.error('Error', e.message);
                    },
                    onclose: (e) => {
                        console.error('Gemini session closed:', e.reason);
                        sessionRef.current = null;
                    },
                },
            });
            sessionRef.current = startSession;
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
            recorder!.stop();
            setDisableBtn(true);
            startResponseTimer();
        }
        setRecord(!record);
    };

    useEffect(() => {
        setTranscriptBuffer("");
    }, [responseLog])

    useEffect(() => {
        initSession();

        return () => {
            console.log("Closing Gemini Connection", sessionRef);
            sessionRef.current?.close();
        };
    }, []);

    useEffect(() => {
        if (audioReady) {
            if (timeoutID) clearTimeout(timeoutID);
            playBase64Pcm(responseAudioString, responseMimeType);
            setResponseAudioString("");
            setResponseMimeType("");
            setProcessing(false);
            setDisableBtn(false);
            setResponseLog(prevResponses => [...prevResponses, { id: prevResponses.length + 1, text: transcriptBuffer }]);
        }
    }, [audioReady]);

    return (
        <div className="flex flex-col h-full w-80 bg-gray-100 border-l border-gray-300">
            {loading && (
                <div className="flex items-center justify-center h-full">
                    <BallTriangle height={100} width={100} radius={5} color="rgba(0, 150, 255, 1)" ariaLabel="ball-triangle-loading" visible={true} />
                </div>
            )}
            {!loading && (
                <>
                    <div id="chat-window" className="flex flex-col flex-1 overflow-y-auto p-2">
                        {responseLog.map(log => (
                            <ChatBubble key={log.id} message={log.text} />
                        ))}
                    </div>
                    <div className="flex justify-center items-center p-3 border-t border-gray-300">
                        <button className="flex items-center justify-center h-10 px-4 rounded-lg bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700" type="button" disabled={disableBtn} onClick={toggleRecordingAudio}>
                            {!processing
                                ? !record ? 'Click to Record' : 'Click to Stop'
                                : <div className="flex items-center gap-2">
                                    <BallTriangle height={25} width={25} radius={5} color="#fafafbff" ariaLabel="ball-triangle-loading" visible={true} /> processing...
                                </div>
                            }
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default GeminiAgent;
