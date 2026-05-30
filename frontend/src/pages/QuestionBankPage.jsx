import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TopBar from "../components/TopBar";
import { fetchQuestionBank, submitQuestionReview } from "../store/questionBank.slice";

const SCORE_PRESETS = [
  { label: "Again", score: 30 },
  { label: "Hard", score: 60 },
  { label: "Easy", score: 90 },
];

const QuestionBankPage = () => {
  const dispatch = useDispatch();
  const { items, status, error, pagination, reviewStatus } = useSelector((state) => state.questionBank);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    dueOnly: true,
    topic: "",
    type: "",
  });

  const query = useMemo(() => {
    const params = {
      page,
      limit: 12,
    };
    if (filters.dueOnly) params.dueOnly = "true";
    if (filters.topic) params.topic = filters.topic;
    if (filters.type) params.type = filters.type;
    return params;
  }, [page, filters]);

  useEffect(() => {
    dispatch(fetchQuestionBank(query));
  }, [dispatch, query]);

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setPage(1);
  };

  const handleReview = (id, score) => {
    dispatch(submitQuestionReview({ id, score }));
  };

  return (
    <div className="min-h-screen bg-[color:var(--neo-bg)]">
      <TopBar />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-2">
            <h1 className="font-display text-3xl md:text-4xl font-extrabold">Question Bank</h1>
            <p className="text-sm text-[color:var(--neo-muted)]">
              Focus on due questions and keep your revision streak alive.
            </p>
          </section>

          <section className="neo-card p-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[color:var(--neo-muted)]">Topic</label>
                <input
                  name="topic"
                  value={filters.topic}
                  onChange={handleFilterChange}
                  className="neo-input px-4 py-2 text-sm"
                  placeholder="e.g. React"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[color:var(--neo-muted)]">Type</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="neo-input px-4 py-2 text-sm"
                >
                  <option value="">All</option>
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                </select>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <input
                  type="checkbox"
                  name="dueOnly"
                  checked={filters.dueOnly}
                  onChange={handleFilterChange}
                  className="h-4 w-4"
                />
                <span className="text-xs font-semibold text-[color:var(--neo-muted)]">Due only</span>
              </div>
            </div>
          </section>

          {status === "loading" && <div className="neo-card p-6 animate-pulse">Loading questions...</div>}
          {status === "failed" && <div className="neo-card p-6 text-sm text-red-400">{error}</div>}

          {status === "succeeded" && items.length === 0 && (
            <div className="neo-card p-6 text-sm text-[color:var(--neo-muted)]">
              No questions found. Answer a few mock interview turns to populate the bank.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <div key={item.id} className="neo-card p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-[color:var(--neo-muted)] uppercase tracking-widest">{item.questionType}</p>
                    <h3 className="font-display text-lg font-bold mt-1">{item.question}</h3>
                  </div>
                  <div className="neo-inset px-3 py-1 rounded-full text-xs font-bold text-[color:var(--neo-accent)]">
                    {item.difficulty || "medium"}
                  </div>
                </div>

                {item.topicTags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.topicTags.map((tag) => (
                      <span key={tag} className="text-[10px] neo-inset px-2 py-1 rounded text-[color:var(--neo-muted)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-xs text-[color:var(--neo-muted)]">
                  Seen {item.timesSeen}x • Last score {item.lastScore || "-"}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {SCORE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      className="neo-button px-4 py-2 text-xs font-semibold"
                      disabled={reviewStatus === "loading"}
                      onClick={() => handleReview(item.id, preset.score)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
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
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuestionBankPage;
