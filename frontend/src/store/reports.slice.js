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

export const createReport = createAsyncThunk(
  "reports/createReport",
  async (payload, { rejectWithValue }) => {
    try {
      return await api.post("/api/interview", payload);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchReportById = createAsyncThunk(
  "reports/fetchReportById",
  async (reportId, { rejectWithValue }) => {
    try {
      return await api.get(`/api/interview/report/${reportId}`);
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
    detail: null,
    detailStatus: "idle",
    detailError: null,
    createStatus: "idle",
    createError: null,
  },
  reducers: {
    clearReports: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
      state.detail = null;
      state.detailStatus = "idle";
      state.detailError = null;
      state.createStatus = "idle";
      state.createError = null;
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
      })
      .addCase(createReport.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.createError = null;
        if (action.payload?.interviewReport) {
          state.items = [action.payload.interviewReport, ...state.items];
        }
      })
      .addCase(createReport.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload || "Failed to create report";
      })
      .addCase(fetchReportById.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
        state.detail = null;
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.detail = action.payload.interviewReport || null;
      })
      .addCase(fetchReportById.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError = action.payload || "Failed to load report";
      });
  },
});

export const { clearReports } = reportsSlice.actions;
export default reportsSlice.reducer;
