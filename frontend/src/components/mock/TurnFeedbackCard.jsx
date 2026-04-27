import React from "react";

const ScoreCircle = ({ score, label, colorClass }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-[color:var(--neo-bg)] neo-inset"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className={colorClass}
          />
        </svg>
        <span className="absolute font-bold text-sm">{score}/10</span>
      </div>
      <span className="text-[10px] uppercase font-bold tracking-wider text-[color:var(--neo-muted)]">
        {label}
      </span>
    </div>
  );
};

const TurnFeedbackCard = ({ feedback }) => {
  if (!feedback) return null;

  const { scores, feedback: textFeedback, isAdaptiveFollowup } = feedback;

  return (
    <div className="neo-card p-6 bg-gradient-to-br from-[color:var(--neo-bg)] to-[color:var(--neo-bg)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          {isAdaptiveFollowup ? (
            <span className="flex items-center gap-1 text-[color:var(--neo-accent)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Adaptive Feedback
            </span>
          ) : (
            "Turn Feedback"
          )}
        </h3>
        <div className="flex gap-4">
          <ScoreCircle score={scores.communication} label="Comm." colorClass="text-[color:var(--neo-accent)]" />
          <ScoreCircle score={scores.technicalDepth} label="Technical" colorClass="text-[color:var(--neo-success)]" />
          <ScoreCircle score={scores.confidence} label="Confidence" colorClass="text-orange-500" />
        </div>
      </div>

      <div className="neo-inset p-5 rounded-2xl bg-[color:var(--neo-bg)]">
        {typeof textFeedback === "object" && textFeedback !== null ? (
          <div className="flex flex-col gap-4">
            {textFeedback.whatWentWell && (
              <div>
                <h4 className="text-xs font-bold text-[color:var(--neo-success)] uppercase tracking-wider mb-1">What Went Well</h4>
                <p className="text-sm leading-relaxed text-[color:var(--neo-fg)]">{textFeedback.whatWentWell}</p>
              </div>
            )}
            {textFeedback.improveNext && (
              <div>
                <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">To Improve</h4>
                <p className="text-sm leading-relaxed text-[color:var(--neo-fg)]">{textFeedback.improveNext}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-[color:var(--neo-fg)]">
            {textFeedback || "No feedback available for this turn."}
          </p>
        )}
      </div>
    </div>
  );
};

export default TurnFeedbackCard;
