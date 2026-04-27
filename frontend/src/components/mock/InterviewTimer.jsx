import React, { useState, useEffect } from "react";

const InterviewTimer = ({ initialSeconds, onTimeUp }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onTimeUp]);

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  const isLowTime = seconds < 30;

  return (
    <div className="flex items-center gap-4">
      <div className={`neo-inset px-4 py-2 rounded-xl flex items-center gap-2 ${isLowTime ? 'text-red-500' : 'text-[color:var(--neo-muted)]'}`}>
        <svg className={`w-5 h-5 ${isLowTime ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-mono font-bold text-lg">
          {formatTime(seconds)}
        </span>
      </div>
      {isLowTime && (
        <span className="text-xs font-bold text-red-500 animate-pulse uppercase tracking-wider">
          Low Time
        </span>
      )}
    </div>
  );
};

export default InterviewTimer;
