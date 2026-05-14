import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWifi,
  faPhone,
  faCamera,
  faDesktop,
  faClapperboard,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";
import { socket } from "../socket";

type Props = {
  open: boolean;
  conversationId: string;
  voiceChannelName?: string;
  serverName?: string;
  inline?: boolean;
  onClose: () => void;
};

export function VideoCallModal({
  open,
  conversationId,
  voiceChannelName = "Voice",
  serverName = "",
  inline = false,
  onClose,
}: Props) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [callStatus, setCallStatus] = useState("Ready to start call");

  const createPeerConnection = useCallback(() => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
        {
          urls: "stun:stun1.l.google.com:19302",
        },
      ],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("call:ice-candidate", {
          conversationId,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
      }

      setCallStatus("Connected");
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "connected") {
        setCallStatus("Connected");
      }

      if (
        peer.connectionState === "disconnected" ||
        peer.connectionState === "failed"
      ) {
        setCallStatus("Disconnected");
      }

      if (peer.connectionState === "closed") {
        setCallStatus("Call ended");
      }
    };

    peerRef.current = peer;
    return peer;
  }, [conversationId]);

  const startLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error("Local media error:", error);
      setCallStatus("Media access denied");
      throw error;
    }
  }, []);

  const addLocalTracks = useCallback((peer: RTCPeerConnection, stream: MediaStream) => {
    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });
  }, []);

  const createOffer = useCallback(async () => {
    const peer = peerRef.current;
    if (!peer) return;

    setCallStatus("Creating offer...");

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("call:offer", {
      conversationId,
      offer,
    });
  }, [conversationId]);

  const handleOffer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      const peer = peerRef.current || createPeerConnection();

      if (!localStreamRef.current) {
        const stream = await startLocalMedia();
        addLocalTracks(peer, stream);
      }

      setCallStatus("Responding to call...");
      await peer.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("call:answer", {
        conversationId,
        answer,
      });
    },
    [conversationId, createPeerConnection, startLocalMedia, addLocalTracks],
  );

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    const peer = peerRef.current;
    if (!peer) return;

    await peer.setRemoteDescription(new RTCSessionDescription(answer));
  }, []);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    const peer = peerRef.current;
    if (!peer) return;

    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("Add ICE candidate error:", error);
    }
  }, []);

  const startCall = useCallback(async () => {
    if (!conversationId) {
      setCallStatus("Unable to start call");
      return;
    }

    setCallStatus("Preparing your audio and video...");

    const peer = createPeerConnection();
    const stream = await startLocalMedia();

    addLocalTracks(peer, stream);

    socket.emit("call:join", {
      conversationId,
    });

    setCallStatus("Waiting for others to join...");
  }, [conversationId, createPeerConnection, startLocalMedia, addLocalTracks]);

  const toggleCamera = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;
    setCameraEnabled(videoTrack.enabled);
    setCallStatus(videoTrack.enabled ? "Camera enabled" : "Camera disabled");
  };

  const replaceVideoTrack = useCallback(async (newTrack: MediaStreamTrack) => {
    const peer = peerRef.current;
    if (!peer) return;

    const sender = peer
      .getSenders()
      .find((item) => item.track?.kind === "video");

    if (sender) {
      await sender.replaceTrack(newTrack);
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    const localStream = localStreamRef.current;
    if (!localStream) return;

    const cameraTrack = localStream.getVideoTracks()[0];
    if (!cameraTrack) return;

    await replaceVideoTrack(cameraTrack);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }

    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;

    setSharingScreen(false);
    setCallStatus("Back to camera view");
  }, [replaceVideoTrack]);

  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      screenStreamRef.current = screenStream;

      const screenTrack = screenStream.getVideoTracks()[0];
      if (!screenTrack) {
        return;
      }

      await replaceVideoTrack(screenTrack);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      setSharingScreen(true);
      setCallStatus("Sharing your screen");

      screenTrack.onended = () => {
        void stopScreenShare();
      };
    } catch (error) {
      console.error("Share screen error:", error);
    }
  }, [replaceVideoTrack, stopScreenShare]);

  const endCall = () => {
    socket.emit("call:leave", {
      conversationId,
    });

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());

    localStreamRef.current = null;
    screenStreamRef.current = null;

    peerRef.current?.close();
    peerRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    setCameraEnabled(true);
    setSharingScreen(false);
    setCallStatus("Call ended");

    onClose();
  };

  useEffect(() => {
    if (!open) return;

    if (!conversationId) {
      setTimeout(() => {
        setCallStatus("Unable to start call");
      });
      return;
    }

    socket.on("call:user-joined", () => {
      void createOffer();
    });

    socket.on(
      "call:offer",
      ({ offer }: { offer: RTCSessionDescriptionInit }) => {
        void handleOffer(offer);
      },
    );

    socket.on(
      "call:answer",
      ({ answer }: { answer: RTCSessionDescriptionInit }) => {
        void handleAnswer(answer);
      },
    );

    socket.on(
      "call:ice-candidate",
      ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        void handleIceCandidate(candidate);
      },
    );

    socket.on("call:user-left", () => {
      setCallStatus("User left the call");

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
      }
    });

    return () => {
      socket.off("call:user-joined");
      socket.off("call:offer");
      socket.off("call:answer");
      socket.off("call:ice-candidate");
      socket.off("call:user-left");

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());

      peerRef.current?.close();
      peerRef.current = null;
      localStreamRef.current = null;
      screenStreamRef.current = null;
    };
  }, [open, conversationId, startCall, createOffer, handleOffer, handleAnswer, handleIceCandidate]);

  if (!open) return null;

  const wrapperClass = inline ? "w-full" : "fixed bottom-4 left-4 z-50 w-[min(420px,calc(100vw-2rem))]";

  return (
    <div className={wrapperClass}>
      <div className={inline ? "w-full rounded-[1.5rem] p-3" : "overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#18191c]/95 shadow-2xl backdrop-blur-xl"}>
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[12px] items-center flex font-semibold uppercase tracking-[0.2em] text-[#3ba55d]">
                  <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#3ba55d] text-white shadow-sm">
                    <FontAwesomeIcon icon={faWifi} className="text-[11px]" />
                  </span>
                  Voice Connected
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#8e9297] truncate">
                {voiceChannelName} {serverName ? `/ ${serverName}` : ""}
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-[#72767d]">
                {callStatus}
              </p>
            </div>

            <button
              onClick={endCall}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#f04747] hover:bg-[#ea4248] text-white transition"
              aria-label="End call"
            >
              <FontAwesomeIcon icon={faPhone} className="text-base" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">


             <button
              onClick={toggleCamera}
              className={`inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 text-white transition ${
                cameraEnabled ? "bg-[#36393f] hover:bg-[#4e5058]" : "bg-[#f04747] hover:bg-[#ea4248]"
              }`}
              aria-label="Toggle camera"
            >
              <FontAwesomeIcon icon={faCamera} className="text-lg" />
            </button>

            <button
              onClick={() => {
                if (sharingScreen) {
                  void stopScreenShare();
                } else {
                  void startScreenShare();
                }
              }}
              className={`inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 text-white transition ${
                sharingScreen ? "bg-[#3ba55d] hover:bg-[#2f8a4f]" : "bg-[#36393f] hover:bg-[#4e5058]"
              }`}
              aria-label="Toggle screen share"
            >
              <FontAwesomeIcon icon={faDesktop} className="text-lg" />
            </button>

            <button
              disabled
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-[#2f3136] text-[#8e9297] opacity-70 cursor-not-allowed"
              aria-label="Start an activity"
            >
              <FontAwesomeIcon icon={faClapperboard} className="text-lg" />
            </button>

            <button
              disabled
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-[#2f3136] text-[#8e9297] opacity-70 cursor-not-allowed"
              aria-label="Open soundboard"
            >
              <FontAwesomeIcon icon={faSliders} className="text-lg" />
            </button>

          </div>
        </div>
      </div>

      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
    </div>
  );
}
