import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../services/api";

export const fetchReports = createAsyncThunk(
  "reports/fetchReports",
  async (_, { rejectWithValue }) => {
    try {
      return await api.get("/api/interview");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    clearReports: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.interviewReports || [];
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load reports";
      });
  },
});

export const { clearReports } = reportsSlice.actions;
export default reportsSlice.reducer;
