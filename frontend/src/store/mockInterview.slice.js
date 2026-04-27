import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../services/api";

export const startMockSession = createAsyncThunk(
  "mockInterview/start",
  async (config, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/mock-interview/session/start", config);
      console.log(response)
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resumeActiveSession = createAsyncThunk(
  "mockInterview/resume",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/mock-interview/session/active");
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitMockAnswer = createAsyncThunk(
  "mockInterview/submitAnswer",
  async ({ sessionId, answer }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/mock-interview/session/${sessionId}/answer`, { answer });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const completeMockSession = createAsyncThunk(
  "mockInterview/complete",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/mock-interview/session/${sessionId}/complete`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const abandonMockSession = createAsyncThunk(
  "mockInterview/abandon",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/mock-interview/session/${sessionId}/abandon`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  activeSession: null,
  currentQuestion: null,
  currentTurn: null,
  sessionMeta: null,
  lastFeedback: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  submitStatus: "idle",
  submitError: null,
  result: null,
  resultStatus: "idle",
};

const mockInterviewSlice = createSlice({
  name: "mockInterview",
  initialState,
  reducers: {
    clearSessionState: (state) => {
      state.activeSession = null;
      state.currentQuestion = null;
      state.currentTurn = null;
      state.sessionMeta = null;
      state.lastFeedback = null;
      state.status = "idle";
      state.error = null;
      state.result = null;
      state.resultStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Start Session
      .addCase(startMockSession.pending, (state) => {
        state.status = "loading";
      })
      .addCase(startMockSession.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { session, turn } = action.payload;
        state.activeSession = session.id;
        state.currentTurn = session.currentTurn;
        state.currentQuestion = turn;
        state.sessionMeta = session;
      })
      .addCase(startMockSession.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Resume Session
      .addCase(resumeActiveSession.fulfilled, (state, action) => {
        if (action.payload && action.payload.session) {
          const { session, currentTurn } = action.payload;
          state.activeSession = session.id;
          state.currentTurn = session.currentTurn;
          state.currentQuestion = currentTurn;
          state.sessionMeta = session;
          state.status = "succeeded";
        }
      })
      // Submit Answer
      .addCase(submitMockAnswer.pending, (state) => {
        state.submitStatus = "loading";
      })
      .addCase(submitMockAnswer.fulfilled, (state, action) => {
        state.submitStatus = "succeeded";
        const { evaluation, nextTurn, isLastTurn } = action.payload;
        state.lastFeedback = evaluation;
        
        if (isLastTurn) {
          state.status = "completed";
          state.currentQuestion = null;
        } else {
          state.currentQuestion = nextTurn;
          state.currentTurn = nextTurn.turnNumber;
        }
      })
      .addCase(submitMockAnswer.rejected, (state, action) => {
        state.submitStatus = "failed";
        state.submitError = action.payload;
      })
      // Complete Session
      .addCase(completeMockSession.pending, (state) => {
        state.resultStatus = "loading";
      })
      .addCase(completeMockSession.fulfilled, (state, action) => {
        state.resultStatus = "succeeded";
        state.result = action.payload.session;
        state.activeSession = null; // Session is finished
      })
      .addCase(completeMockSession.rejected, (state, action) => {
        state.resultStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearSessionState } = mockInterviewSlice.actions;
export default mockInterviewSlice.reducer;
