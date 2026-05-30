import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../services/api";

export const fetchQuestionBank = createAsyncThunk(
  "questionBank/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const search = new URLSearchParams(params).toString();
      return await api.get(`/api/mock-interview/question-bank${search ? `?${search}` : ""}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitQuestionReview = createAsyncThunk(
  "questionBank/review",
  async ({ id, score }, { rejectWithValue }) => {
    try {
      return await api.post(`/api/mock-interview/question-bank/${id}/review`, { score });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const questionBankSlice = createSlice({
  name: "questionBank",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    pagination: null,
    reviewStatus: "idle",
    reviewError: null,
  },
  reducers: {
    clearQuestionBank: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
      state.pagination = null;
      state.reviewStatus = "idle";
      state.reviewError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestionBank.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchQuestionBank.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchQuestionBank.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load question bank";
      })
      .addCase(submitQuestionReview.pending, (state) => {
        state.reviewStatus = "loading";
        state.reviewError = null;
      })
      .addCase(submitQuestionReview.fulfilled, (state, action) => {
        state.reviewStatus = "succeeded";
        const updated = action.payload.item;
        if (updated?.id) {
          state.items = state.items.map((item) => (item.id === updated.id ? { ...item, ...updated } : item));
        }
      })
      .addCase(submitQuestionReview.rejected, (state, action) => {
        state.reviewStatus = "failed";
        state.reviewError = action.payload || "Failed to submit review";
      });
  },
});

export const { clearQuestionBank } = questionBankSlice.actions;
export default questionBankSlice.reducer;
