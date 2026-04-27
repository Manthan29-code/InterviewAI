import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TopBar from "../components/TopBar";
import { completeMockSession, clearSessionState } from "../store/mockInterview.slice";

const ScoreBar = ({ label, score, colorClass }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <span className="text-sm font-bold">{label}</span>
      <span className="text-sm font-bold">{score}/100</span>
    </div>
    <div className="neo-inset h-3 w-full rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full ${colorClass} transition-all duration-1000 ease-out`}
        style={{ width: `${score}%` }}
      />
    </div>
  </div>
);

const MockInterviewResult = () => {
  const { sessionId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { result, resultStatus } = useSelector((state) => state.mockInterview);

  useEffect(() => {
    if (!result) {
      dispatch(completeMockSession(sessionId));
    }
  }, [dispatch, sessionId, result]);

  const handleDone = () => {
    dispatch(clearSessionState());
    navigate("/mock-interview");
  };

  if (resultStatus === "loading" || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="neo-card p-12 flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-[color:var(--neo-accent)] border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold">Analyzing Your Performance</h2>
            <p className="text-[color:var(--neo-muted)]">Our AI is generating your final report...</p>
          </div>
        </div>
      </div>
    );
  }

  const { overallScores, summary } = result;

  return (
    <div className="min-h-screen bg-[color:var(--neo-bg)]">
      <TopBar />
      <main className="mx-auto max-w-5xl px-6 pb-20 pt-8">
        <div className="flex flex-col gap-10">
          {/* Hero Header */}
          <section className="text-center flex flex-col gap-4">
            <div className="mx-auto neo-raise w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-[color:var(--neo-accent)] to-[color:var(--neo-accent-light)] shadow-lg shadow-[color:var(--neo-accent)]/20">
              <span className="text-white text-3xl font-black">
                {Math.round((overallScores.communication + overallScores.technicalDepth + overallScores.confidence) / 3)}
              </span>
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight">
              Interview <span className="text-[color:var(--neo-accent)]">Complete</span>
            </h1>
            <p className="text-[color:var(--neo-muted)]">
              Great job! Here is how you performed in your session.
            </p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Scores Column */}
            <div className="lg:col-span-1 flex flex-col gap-8">
              <div className="neo-card p-8 flex flex-col gap-6">
                <h3 className="font-display font-bold text-xl">Dimension Scores</h3>
                <div className="flex flex-col gap-6">
                  <ScoreBar label="Communication" score={overallScores.communication} colorClass="bg-[color:var(--neo-accent)]" />
                  <ScoreBar label="Technical Depth" score={overallScores.technicalDepth} colorClass="bg-[color:var(--neo-success)]" />
                  <ScoreBar label="Confidence" score={overallScores.confidence} colorClass="bg-orange-500" />
                </div>
              </div>

              <div className="neo-card p-8 flex flex-col gap-4">
                <h3 className="font-display font-bold text-lg">Next Focus</h3>
                <div className="neo-inset p-4 rounded-xl text-sm leading-relaxed italic text-[color:var(--neo-muted)]">
                  "{summary.nextFocus}"
                </div>
              </div>
            </div>

            {/* Analysis Column */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              <section className="neo-card p-8">
                <h3 className="font-display font-bold text-2xl mb-6">Detailed Analysis</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-[color:var(--neo-success)] flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Strengths
                    </h4>
                    <ul className="flex flex-col gap-3">
                      {summary.strengths.map((s, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[color:var(--neo-success)] shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-orange-500 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Areas to Improve
                    </h4>
                    <ul className="flex flex-col gap-3">
                      {summary.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section className="neo-card p-8">
                <h3 className="font-display font-bold text-xl mb-4">Weekly Improvement Plan</h3>
                <div className="neo-inset p-6 rounded-2xl bg-[color:var(--neo-bg)]">
                   <p className="text-sm leading-relaxed whitespace-pre-line">
                     {summary.weeklyPlan}
                   </p>
                </div>
              </section>

              <div className="flex gap-4 justify-end">
                <button 
                  onClick={handleDone}
                  className="neo-button px-8 py-3 font-bold text-[color:var(--neo-muted)]"
                >
                  Back to Simulator
                </button>
                <Link 
                  to="/mock-interview/roadmap"
                  className="neo-button px-8 py-3 bg-[color:var(--neo-accent)] text-white font-bold"
                >
                  View Skill Roadmap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MockInterviewResult;
