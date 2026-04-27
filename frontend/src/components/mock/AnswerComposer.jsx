import React, { useState, useEffect } from "react";

const AnswerComposer = ({ onSubmit, isLoading, sessionId, turnNumber }) => {
  const [answer, setAnswer] = useState("");

  // Local storage for draft saving
  const draftKey = `mock_draft_${sessionId}_${turnNumber}`;

  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      setAnswer(savedDraft);
    }
  }, [draftKey]);

  useEffect(() => {
    if (answer) {
      localStorage.setItem(draftKey, answer);
    }
  }, [answer, draftKey]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim() || isLoading) return;
    onSubmit(answer);
    localStorage.removeItem(draftKey);
    setAnswer("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="relative">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="neo-input w-full min-h-[200px] p-6 text-base leading-relaxed focus-visible:ring-2 focus-visible:ring-[color:var(--neo-accent)] resize-none"
          disabled={isLoading}
        />
        <div className="absolute bottom-4 right-4 text-xs text-[color:var(--neo-muted)]">
          {answer.length} characters
        </div>
      </div>
      
      <div className="flex justify-end items-center gap-4">
        <span className="text-xs text-[color:var(--neo-muted)] italic">
          Draft auto-saved locally
        </span>
        <button
          type="submit"
          disabled={!answer.trim() || isLoading}
          className="neo-button px-8 py-3 bg-[color:var(--neo-accent)] text-white font-bold disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            "Submit Answer"
          )}
        </button>
      </div>
    </form>
  );
};

export default AnswerComposer;
