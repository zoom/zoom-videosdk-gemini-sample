import { useState, useEffect, useRef } from "react";
import { BallTriangle } from "react-loader-spinner";
import ZoomVideo, { VideoQuality } from "@zoom/videosdk";
import "./Video.css"

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            'video-player-container': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

interface VideoProps {
    client: ReturnType<typeof ZoomVideo.createClient>
}

const Video = ({ client }: VideoProps) => {
    const [width, setWidth] = useState(80);
    const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const stream = client.getMediaStream();
    const userAdded = (payload: any[]) => {
        console.log('video: ' + JSON.stringify(payload) + ' joined the session');
        renderGalleryView();
    };

    const userRemoved = (payload: any[]) => {
        console.log("PAYLOAD", { payload });
        payload.forEach((user: any) => {
            let el = document.getElementById(user.userId)
            if (el) el.remove();
        });
        renderGalleryView();
    };

    const peerVideoStateChanged = (payload: any) => {
        if (payload.action === 'Start') renderGalleryView();
        else if (payload.action === 'Stop') {
            stream.detachVideo(payload.userId)
            let el = document.getElementById(payload.userId);
            if (el) el.replaceChildren();
            renderGalleryView();
        }
    };

    const setupVideo = () => {
        client.on('user-added', userAdded);
        client.on('user-removed', userRemoved);
        client.on('peer-video-state-change', peerVideoStateChanged);
    };

    //if overflow is detected, decrease the width until no overflow. Then increase width to max size without overflow in 2nd while loop
    const isOverflowing = (element: Element | null) => {
        if (element && "scrollWidth" in element) {
            const hasHorizontalOverflow = Math.floor(element.scrollWidth - 1) > Math.floor(element.clientWidth);
            const hasVerticalOverflow = Math.floor(element.scrollHeight - 1) > Math.floor(element.clientHeight);
            return hasHorizontalOverflow || hasVerticalOverflow;
        }
    }
    const setVidContainerWidth = (vid_width: number) => {
        const elements = document.querySelectorAll('.video-player-div');
        elements.forEach(element => {
            (element as HTMLElement).style.width = vid_width + '%';
        });
    };
    const adjustVidContainerWidth = () => {
        console.log("adjusting videos");

        let container = document.querySelector('video-player-container');
        let newWidth = width;

        while (newWidth > 30) {
            if (isOverflowing(container)) {
                newWidth -= 1;
                setVidContainerWidth(newWidth);
            } else break;
        }
        while (newWidth < 100) {
            if (isOverflowing(container)) {
                break;
            } else {
                newWidth += 1;
                setVidContainerWidth(newWidth);
            }
        }

        setVidContainerWidth(newWidth - 1);
        setWidth(newWidth - 1);
    }

    const renderGalleryView = () => {
        let users = client.getAllUser();

        users.forEach(async (user) => {
            if (!document.getElementById(String(user.userId))) {
                const newDiv = document.createElement("div");
                newDiv.id = String(user.userId);
                newDiv.className = 'video-player-div';
                let videoContainer = document.querySelector('video-player-container');
                if (videoContainer) videoContainer.appendChild(newDiv);
                console.log('video-player-div created for ' + user.userId);
            }

            if (user.bVideoOn) {
                let el = document.getElementById(String(user.userId));
                if (el) {
                    el.style.width = (users.length > 1) ? width + '%' : '80%';
                    el.className = "video-player-div";

                    let userVideo = await stream.attachVideo(user.userId, VideoQuality.Video_720P);
                    el.replaceChildren();
                    el.appendChild(userVideo as unknown as Node);
                }
            } else {
                let el = document.getElementById(String(user.userId));
                if (el) {
                    el.style.width = (users.length > 1) ? width + '%' : '80%';

                    const noVidDiv = document.createElement("div");
                    noVidDiv.id = user.userId + '-video-off';
                    noVidDiv.className = 'video-off';
                    noVidDiv.innerHTML = "<h2>" + user.displayName + "</h2>"
                    el.replaceChildren();
                    el.appendChild(noVidDiv);
                }
            }
        });

        adjustVidContainerWidth();
    };

    useEffect(() => {
        setupVideo();
        renderGalleryView();

        const handleResize = () => {
            if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
            resizeTimerRef.current = setTimeout(() => {
                renderGalleryView();
            }, 100);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
        };
    }, []);

    if (!client && !stream) {
        return (
            <div className="flex items-center w-48 m-auto mt-96">
                <BallTriangle height={200} width={200} radius={5} color="#0096FF" ariaLabel="ball-triangle-loading" visible={true} />
            </div>
        );
    } else {
        return (
            <div className="video-component-container">
                <video-player-container></video-player-container>
            </div>
        );
    }
}

export default Video;
