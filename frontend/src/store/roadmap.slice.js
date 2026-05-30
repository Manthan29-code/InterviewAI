import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../services/api";

export const generateRoadmap = createAsyncThunk(
  "roadmap/generate",
  async (reportId, { rejectWithValue }) => {
    try {
      return await api.post("/api/mock-interview/roadmap/generate", { reportId });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRoadmap = createAsyncThunk(
  "roadmap/fetch",
  async (reportId, { rejectWithValue }) => {
    try {
      const query = reportId ? `?reportId=${reportId}` : "";
      return await api.get(`/api/mock-interview/roadmap${query}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateRoadmapTask = createAsyncThunk(
  "roadmap/updateTask",
  async ({ roadmapId, taskId, status }, { rejectWithValue }) => {
    try {
      return await api.patch(`/api/mock-interview/roadmap/${roadmapId}/task/${taskId}`, { status });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const roadmapSlice = createSlice({
  name: "roadmap",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    generateStatus: "idle",
    generateError: null,
    updateStatus: "idle",
    updateError: null,
  },
  reducers: {
    clearRoadmap: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
      state.generateStatus = "idle";
      state.generateError = null;
      state.updateStatus = "idle";
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoadmap.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRoadmap.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.roadmaps || [];
      })
      .addCase(fetchRoadmap.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load roadmaps";
      })
      .addCase(generateRoadmap.pending, (state) => {
        state.generateStatus = "loading";
        state.generateError = null;
      })
      .addCase(generateRoadmap.fulfilled, (state, action) => {
        state.generateStatus = "succeeded";
        const newRoadmaps = action.payload.roadmaps || [];
        if (newRoadmaps.length > 0) {
          const byId = new Map(state.items.map((item) => [item.id, item]));
          newRoadmaps.forEach((item) => byId.set(item.id, item));
          state.items = Array.from(byId.values());
        }
      })
      .addCase(generateRoadmap.rejected, (state, action) => {
        state.generateStatus = "failed";
        state.generateError = action.payload || "Failed to generate roadmap";
      })
      .addCase(updateRoadmapTask.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateRoadmapTask.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const updated = action.payload.roadmap;
        if (updated?.id) {
          state.items = state.items.map((item) => (item.id === updated.id ? { ...item, ...updated } : item));
        }
      })
      .addCase(updateRoadmapTask.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload || "Failed to update task";
      });
  },
});

export const { clearRoadmap } = roadmapSlice.actions;
export default roadmapSlice.reducer;
