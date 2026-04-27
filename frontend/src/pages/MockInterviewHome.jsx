import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import MockInterviewConfigForm from "../components/mock/MockInterviewConfigForm";
import { resumeActiveSession } from "../store/mockInterview.slice";

const MockInterviewHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeSession, sessionMeta, status } = useSelector((state) => state.mockInterview);

  useEffect(() => {
    dispatch(resumeActiveSession());
  }, [dispatch]);

  const handleAbandon = () => {
    if (window.confirm("Abandon this session? Progress will be lost.")) {
      dispatch(abandonMockSession(activeSession)).then(() => {
        dispatch(clearSessionState());
        dispatch(resumeActiveSession());
      });
    }
  };

  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto max-w-4xl px-6 pb-16 pt-8">
        <div className="flex flex-col gap-8">
          <section className="text-center flex flex-col gap-4">
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
              Mock Interview <span className="text-[color:var(--neo-accent)]">Simulator</span>
            </h1>
            <p className="text-[color:var(--neo-muted)] text-lg max-w-2xl mx-auto">
              Master your interview skills with our AI-powered simulator. 
              Get real-time feedback, adaptive questions, and detailed performance insights.
            </p>
          </section>

          <section className="neo-card p-8 md:p-12">
            {activeSession ? (
              <div className="flex flex-col gap-8">
                <div className="text-center">
                   <div className="neo-inset w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[color:var(--neo-accent)]">
                      <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                   </div>
                   <h2 className="font-display text-2xl font-bold">Session in Progress</h2>
                   <p className="text-[color:var(--neo-muted)]">
                     You have an active <strong>{sessionMeta?.targetRole || "interview"}</strong> session.
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => navigate(`/mock-interview/session/${activeSession}`)}
                    className="neo-button py-4 bg-[color:var(--neo-accent)] text-white font-bold flex items-center justify-center gap-2"
                  >
                    Resume Interview
                  </button>
                  <button
                    onClick={handleAbandon}
                    className="neo-button py-4 font-bold text-red-500"
                  >
                    Abandon Session
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-bold">Configure Your Session</h2>
                  <p className="text-sm text-[color:var(--neo-muted)]">
                    Tell us about the role you're interviewing for.
                  </p>
                </div>
                <MockInterviewConfigForm />
              </>
            )}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="neo-card p-6 flex flex-col gap-3">
              <div className="neo-inset w-10 h-10 rounded-xl flex items-center justify-center text-[color:var(--neo-accent)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold">Adaptive AI</h3>
              <p className="text-xs text-[color:var(--neo-muted)]">
                Questions change based on your previous answers to probe your knowledge.
              </p>
            </div>
            <div className="neo-card p-6 flex flex-col gap-3">
              <div className="neo-inset w-10 h-10 rounded-xl flex items-center justify-center text-[color:var(--neo-success)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold">Real Feedback</h3>
              <p className="text-xs text-[color:var(--neo-muted)]">
                Get specific scores on communication, technical depth, and confidence.
              </p>
            </div>
            <div className="neo-card p-6 flex flex-col gap-3">
              <div className="neo-inset w-10 h-10 rounded-xl flex items-center justify-center text-orange-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold">Timed Turns</h3>
              <p className="text-xs text-[color:var(--neo-muted)]">
                Simulate real pressure with customizable time limits for each question.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MockInterviewHome;
