import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TopBar from "../components/TopBar";
import InterviewTimer from "../components/mock/InterviewTimer";
import AnswerComposer from "../components/mock/AnswerComposer";
import TurnFeedbackCard from "../components/mock/TurnFeedbackCard";
import { 
  submitMockAnswer, 
  completeMockSession, 
  resumeActiveSession,
  abandonMockSession
} from "../store/mockInterview.slice";

const MockInterviewSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { 
    currentQuestion, 
    currentTurn, 
    sessionMeta, 
    lastFeedback,
    submitStatus,
    status
  } = useSelector((state) => state.mockInterview);

  useEffect(() => {
    if (!currentQuestion) {
      dispatch(resumeActiveSession());
    }
  }, [dispatch, currentQuestion]);

  useEffect(() => {
    if (status === "completed") {
        navigate(`/mock-interview/result/${sessionId}`);
    }
  }, [status, sessionId, navigate]);

  const handleSubmitAnswer = (answer) => {
    dispatch(submitMockAnswer({ sessionId, answer }));
  };

  const handleCompleteEarly = () => {
    if (window.confirm("Are you sure you want to end the interview early?")) {
      dispatch(completeMockSession(sessionId));
    }
  };

  const handleAbandon = () => {
    if (window.confirm("Abandon session? Progress will not be saved.")) {
      dispatch(abandonMockSession(sessionId));
      navigate("/mock-interview");
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="neo-card p-8 animate-pulse">
          Loading session...
        </div>
      </div>
    );
  }

  const isAdaptive = currentQuestion.questionType === "adaptive-followup";

  return (
    <div className="min-h-screen bg-[color:var(--neo-bg)]">
      <TopBar />
      <main className="mx-auto max-w-5xl px-6 pb-16 pt-8">
        <div className="flex flex-col gap-8">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="neo-inset px-3 py-1 rounded-full text-xs font-bold text-[color:var(--neo-accent)] uppercase tracking-wider">
                  Turn {currentTurn} of {sessionMeta?.maxTurns || "?"}
                </span>
                {isAdaptive && (
                  <span className="neo-raise px-3 py-1 rounded-full text-xs font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Adaptive
                  </span>
                )}
              </div>
              <h2 className="font-display text-xl font-bold mt-2">
                {sessionMeta?.targetRole} Interview
              </h2>
            </div>
            
            <InterviewTimer 
              initialSeconds={currentQuestion.timeLimitSec || 180} 
              onTimeUp={() => {
                // Handle time up - maybe auto-submit or show warning
              }}
            />
          </div>

          {/* Question Card */}
          <section className="neo-card p-8 md:p-10 border-l-4 border-[color:var(--neo-accent)]">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-[color:var(--neo-muted)] uppercase tracking-widest">
                Current Question
              </h3>
              <p className="text-xl md:text-2xl font-medium leading-relaxed">
                {currentQuestion.question}
              </p>
              
              {currentQuestion.expectedSignals && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {currentQuestion.expectedSignals.map((signal, i) => (
                    <span key={i} className="text-[10px] bg-[color:var(--neo-bg)] neo-inset px-2 py-1 rounded text-[color:var(--neo-muted)]">
                      {signal}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Answer Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <AnswerComposer 
                onSubmit={handleSubmitAnswer} 
                isLoading={submitStatus === "loading"}
                sessionId={sessionId}
                turnNumber={currentTurn}
              />
            </div>
            
            <aside className="flex flex-col gap-6">
              {lastFeedback && (
                <TurnFeedbackCard feedback={lastFeedback} />
              )}
              
              <div className="neo-card p-6 flex flex-col gap-4">
                <h4 className="font-bold text-sm">Session Actions</h4>
                <button 
                  onClick={handleCompleteEarly}
                  className="neo-button w-full py-2 text-sm font-medium text-[color:var(--neo-muted)] hover:text-[color:var(--neo-accent)]"
                >
                  End Interview Early
                </button>
                <button 
                  onClick={handleAbandon}
                  className="neo-button w-full py-2 text-sm font-medium text-red-400"
                >
                  Abandon Session
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MockInterviewSession;
