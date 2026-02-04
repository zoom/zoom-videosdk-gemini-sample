import KJUR from "jsrsasign";

// You should sign your JWT with a backend service in a production use-case
export function generateSignature(sessionName: string, role: number, sdkKey: string, sdkSecret: string) {
  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;
  const oHeader = { alg: "HS256", typ: "JWT" };

  const oPayload = {
    app_key: sdkKey,
    tpc: sessionName,
    role_type: role,
    version: 1,
    iat: iat,
    exp: exp,
  };

  const sHeader = JSON.stringify(oHeader);
  const sPayload = JSON.stringify(oPayload);
  const sdkJWT = KJUR.KJUR.jws.JWS.sign("HS256", sHeader, sPayload, sdkSecret);
  return sdkJWT;
}

export async function convertWebMToPCM(webmBlob: any) {
  const audioContext = new (window.AudioContext || window.AudioContext)();
  const arrayBuffer = await webmBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const rawData = audioBuffer.getChannelData(0); 
  
  const pcmData = new Int16Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    const s = Math.max(-1, Math.min(1, rawData[i]));
    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return new Blob([pcmData.buffer], { type: 'audio/pcm' });
}


export async function playPcmBlob(pcmBlob:any, sampleRate = 16000) {
    const arrayBuffer = await pcmBlob.arrayBuffer();
    const audioContext = new (window.AudioContext || window.AudioContext)();
    const int16Array = new Int16Array(arrayBuffer);
    const float32Array = new Float32Array(int16Array.length);

    for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 0x7FFF; // 0x7FFF is max value for Int16
    }

    const audioBuffer = audioContext.createBuffer(1, float32Array.length, sampleRate);
    audioBuffer.copyToChannel(float32Array, 0); // Copy data to the first channel

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);

    source.start(0);

    source.onended = () => {
        console.log("Playback finished");
    };
}

export async function blobToBase64(blob: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (!reader.result) return; 
      const base64String = (<string>reader.result).split(',')[1];
      resolve(base64String);
    };

    // Event handler for potential errors during reading
    reader.onerror = (error) => {
      reject(error);
    };

    // Read the Blob as a Data URL to get the built-in Base64 conversion
    reader.readAsDataURL(blob);
  });
}

// Function to decode base64 string to an ArrayBuffer
function base64ToArrayBuffer(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Function to play PCM audio
export async function playBase64Pcm(base64PcmString: string, mimeType: string) {

    const sampleRate = parseInt(mimeType.split(';')[1].split('=')[1]);

    const audioContext = new (window.AudioContext || window.AudioContext)();
    
    const pcmArrayBuffer = base64ToArrayBuffer(base64PcmString);

    const int16Array = new Int16Array(pcmArrayBuffer);
    const numberOfChannels = 1; 
    const audioBuffer = audioContext.createBuffer(
        numberOfChannels, 
        int16Array.length, 
        sampleRate
    );

    const nowBuffering = audioBuffer.getChannelData(0);
    for (let i = 0; i < int16Array.length; i++) {
        nowBuffering[i] = int16Array[i] / 32768.0; 
    }

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
}