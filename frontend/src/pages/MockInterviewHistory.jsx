import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import ProgressTrendChart from "../components/mock/ProgressTrendChart";
import { fetchMockHistory, fetchMockTrends } from "../store/mockInterview.slice";

const MockInterviewHistory = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [window, setWindow] = useState("30d");

  const { historyItems, historyStatus, historyPagination, historyError, trends, trendsStatus } = useSelector(
    (state) => state.mockInterview
  );

  useEffect(() => {
    dispatch(fetchMockHistory({ page, limit: 10 }));
  }, [dispatch, page]);

  useEffect(() => {
    dispatch(fetchMockTrends(window));
  }, [dispatch, window]);

  return (
    <div className="min-h-screen bg-[color:var(--neo-bg)]">
      <TopBar />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-2">
            <h1 className="font-display text-3xl md:text-4xl font-extrabold">Interview History</h1>
            <p className="text-sm text-[color:var(--neo-muted)]">
              Review your past sessions and track your progress over time.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Score Trends</h2>
              <select
                className="neo-input text-sm px-3 py-2"
                value={window}
                onChange={(event) => setWindow(event.target.value)}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            {trendsStatus === "loading" ? (
              <div className="neo-card p-6 animate-pulse">Loading trends...</div>
            ) : (
              <ProgressTrendChart trends={trends} />
            )}
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Recent Sessions</h2>
              {historyPagination && (
                <div className="text-xs text-[color:var(--neo-muted)]">
                  Page {historyPagination.page} of {historyPagination.totalPages}
                </div>
              )}
            </div>

            {historyStatus === "loading" && (
              <div className="neo-card p-6 animate-pulse">Loading history...</div>
            )}

            {historyStatus === "failed" && (
              <div className="neo-card p-6 text-sm text-red-400">{historyError || "Failed to load history."}</div>
            )}

            {historyStatus === "succeeded" && historyItems.length === 0 && (
              <div className="neo-card p-6 text-sm text-[color:var(--neo-muted)]">
                No sessions yet. Start a mock interview to build your history.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {historyItems.map((session) => (
                <div key={session.id} className="neo-card p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="neo-inset px-3 py-1 rounded-full text-xs font-bold text-[color:var(--neo-accent)]">
                      {session.status}
                    </span>
                    <span className="text-xs text-[color:var(--neo-muted)]">
                      {session.endedAt ? new Date(session.endedAt).toLocaleDateString() : "In progress"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">{session.targetRole}</h3>
                    <p className="text-xs text-[color:var(--neo-muted)]">Difficulty: {session.difficulty}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      Overall: <span className="font-semibold">{session.overallScores?.overall || "-"}</span>
                    </div>
                    {session.status === "active" ? (
                      <Link
                        to={`/mock-interview/session/${session.id}`}
                        className="text-xs font-semibold text-[color:var(--neo-accent)]"
                      >
                        Resume
                      </Link>
                    ) : (
                      <span className="text-xs text-[color:var(--neo-muted)]">Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {historyPagination && historyPagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  className="neo-button px-4 py-2 text-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </button>
                <button
                  className="neo-button px-4 py-2 text-sm"
                  disabled={page >= historyPagination.totalPages}
                  onClick={() => setPage((prev) => Math.min(historyPagination.totalPages, prev + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default MockInterviewHistory;
