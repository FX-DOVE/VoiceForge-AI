"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Play, Pause, Trash2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const MIN_SECONDS = 30;
const MAX_SECONDS = 300;

export function VoiceRecorder({ onUse }) {
  const [status, setStatus] = useState("idle"); // idle | recording | recorded | playing | denied
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  const [level, setLevel] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const rafRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
    clearInterval(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
  }

  async function startRecording() {
    setError("");
    setAudioUrl("");
    setSeconds(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio level meter
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLevel(Math.min(1, avg / 140));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setStatus("recorded");
        cancelAnimationFrame(rafRef.current);
        setLevel(0);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (audioCtxRef.current) {
          try {
            audioCtxRef.current.close();
          } catch {}
          audioCtxRef.current = null;
        }
      };
      mr.start();
      setStatus("recording");
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (next >= MAX_SECONDS) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatus("denied");
      setError(
        err?.name === "NotAllowedError"
          ? "Microphone permission denied. Enable it in your browser settings to record."
          : "Could not access microphone. Please make sure one is connected."
      );
    }
  }

  function stopRecording() {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  function discard() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl("");
    setSeconds(0);
    setStatus("idle");
  }

  function handleUse() {
    if (!audioUrl) return;
    fetch(audioUrl)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: blob.type || "audio/webm",
        });
        onUse?.([file]);
      });
  }

  const tooShort = status === "recorded" && seconds < MIN_SECONDS;

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] border-2 border-dashed border-white/10 p-6 sm:p-10 lg:p-16 bg-white/[0.01]">
      {/* Mic Visual */}
      <div className="relative">
        <div
          className={cn(
            "size-24 sm:size-28 rounded-full flex items-center justify-center transition-all",
            status === "recording"
              ? "bg-red-500/20 ring-4 ring-red-500/30"
              : status === "recorded"
              ? "bg-green-500/20 ring-4 ring-green-500/20"
              : "bg-primary/10 ring-2 ring-primary/20"
          )}
          style={{
            transform: status === "recording" ? `scale(${1 + level * 0.15})` : undefined,
          }}
        >
          {status === "recorded" ? (
            <Check className="size-10 text-green-400" />
          ) : (
            <Mic
              className={cn(
                "size-10",
                status === "recording" ? "text-red-400" : "text-primary"
              )}
            />
          )}
        </div>
        {status === "recording" && (
          <span className="absolute -top-1 -right-1 size-4 rounded-full bg-red-500 animate-pulse ring-2 ring-background" />
        )}
      </div>

      {/* Headline */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-white">
          {status === "recording"
            ? "Recording..."
            : status === "recorded"
            ? "Recording Captured"
            : "Record Your Voice"}
        </h3>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-sm px-2">
          {status === "recording"
            ? "Read a natural paragraph of at least 30 seconds. Speak clearly in a quiet room."
            : status === "recorded"
            ? "Preview your recording below. Re-record if you want to try again."
            : "Use your microphone to capture a clean 30s–5min sample directly in the browser."}
        </p>
      </div>

      {/* Timer / Meter */}
      {(status === "recording" || status === "recorded") && (
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <span
            className={cn(
              "font-mono text-3xl sm:text-4xl font-bold tracking-tight",
              status === "recording" ? "text-red-400" : "text-white"
            )}
          >
            {formatTime(seconds)}
          </span>
          {status === "recording" && (
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-[width] duration-75"
                style={{ width: `${Math.max(8, level * 100)}%` }}
              />
            </div>
          )}
          {tooShort && (
            <div className="flex items-center gap-2 text-xs text-orange-400">
              <AlertCircle className="size-3.5" />
              <span>At least 30 seconds is recommended.</span>
            </div>
          )}
        </div>
      )}

      {/* Audio Preview */}
      {status === "recorded" && audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          controls
          className="w-full max-w-xs"
          aria-label="Recorded sample preview"
        />
      )}

      {/* Error */}
      {status === "denied" && (
        <div className="flex items-start gap-3 max-w-sm px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {status !== "recording" && status !== "recorded" && (
          <Button
            type="button"
            onClick={startRecording}
            className="h-12 px-8 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold"
          >
            <Mic className="mr-2 size-4" />
            Start Recording
          </Button>
        )}

        {status === "recording" && (
          <Button
            type="button"
            onClick={stopRecording}
            className="h-12 px-8 bg-red-500 hover:bg-red-500/90 text-white rounded-full font-bold"
          >
            <Square className="mr-2 size-4 fill-current" />
            Stop
          </Button>
        )}

        {status === "recorded" && (
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={discard}
              className="h-12 px-6 rounded-full font-bold text-on-surface-variant hover:text-white"
            >
              <Trash2 className="mr-2 size-4" />
              Re-record
            </Button>
            <Button
              type="button"
              onClick={handleUse}
              disabled={tooShort}
              className="h-12 px-8 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold disabled:opacity-50"
            >
              <Check className="mr-2 size-4" />
              Use Recording
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
