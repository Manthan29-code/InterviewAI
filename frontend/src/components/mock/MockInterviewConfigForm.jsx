import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { startMockSession } from "../../store/mockInterview.slice";

const MockInterviewConfigForm = () => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.mockInterview);
  
  const [config, setConfig] = useState({
    targetRole: "",
    difficulty: "medium",
    focusAreas: "",
    maxTurns: 5,
    adaptiveEnabled: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!config.targetRole) return;
    
    // Process focusAreas into an array
    const focusAreasArray = config.focusAreas
      ? config.focusAreas.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    dispatch(startMockSession({
      ...config,
      focusAreas: focusAreasArray
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[color:var(--neo-muted)] ml-1">
          Target Role
        </label>
        <input
          type="text"
          name="targetRole"
          value={config.targetRole}
          onChange={handleChange}
          placeholder="e.g. Frontend Developer"
          className="neo-input px-5 py-3 text-sm focus-visible:ring-2 focus-visible:ring-[color:var(--neo-accent)]"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[color:var(--neo-muted)] ml-1">
          Focus Areas (comma separated)
        </label>
        <input
          type="text"
          name="focusAreas"
          value={config.focusAreas}
          onChange={handleChange}
          placeholder="e.g. React, JavaScript, CSS"
          className="neo-input px-5 py-3 text-sm focus-visible:ring-2 focus-visible:ring-[color:var(--neo-accent)]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[color:var(--neo-muted)] ml-1">
            Difficulty
          </label>
          <select
            name="difficulty"
            value={config.difficulty}
            onChange={handleChange}
            className="neo-input px-5 py-3 text-sm focus-visible:ring-2 focus-visible:ring-[color:var(--neo-accent)] appearance-none"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[color:var(--neo-muted)] ml-1">
            Max Questions
          </label>
          <input
            type="number"
            name="maxTurns"
            min="1"
            max="15"
            value={config.maxTurns}
            onChange={handleChange}
            className="neo-input px-5 py-3 text-sm focus-visible:ring-2 focus-visible:ring-[color:var(--neo-accent)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-1">
        <div className="relative flex items-center justify-center w-6 h-6">
          <input
            type="checkbox"
            name="adaptiveEnabled"
            checked={config.adaptiveEnabled}
            onChange={handleChange}
            className="peer absolute opacity-0 w-full h-full cursor-pointer z-10"
          />
          <div className="neo-inset w-6 h-6 rounded-md peer-checked:bg-[color:var(--neo-accent)] transition-colors flex items-center justify-center">
             {config.adaptiveEnabled && (
               <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
               </svg>
             )}
          </div>
        </div>
        <label className="text-sm font-medium text-[color:var(--neo-muted)] cursor-pointer">
          Enable Adaptive Follow-up Questions
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium ml-1">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="neo-button mt-2 py-4 px-6 bg-[color:var(--neo-accent)] text-white font-bold text-lg disabled:opacity-50"
      >
        {status === "loading" ? "Initializing..." : "Start Mock Interview"}
      </button>
    </form>
  );
};

export default MockInterviewConfigForm;
