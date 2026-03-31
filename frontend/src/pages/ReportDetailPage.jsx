import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { fetchReportById } from "../store/reports.slice";
import { api } from "../services/api";

const ReportDetailPage = () => {
  const dispatch = useDispatch();
  const { reportId } = useParams();
  const { detail, detailStatus, detailError } = useSelector(
    (state) => state.reports
  );
  const [downloadError, setDownloadError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (reportId) {
      dispatch(fetchReportById(reportId));
    }
  }, [dispatch, reportId]);

  const handleDownload = async () => {
    if (!detail?._id) {
      return;
    }

    setDownloading(true);
    setDownloadError(null);

    try {
      const blob = await api.getBlob(`/api/interview/resume/pdf/${detail._id}`);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume_${detail._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(error.message || "Failed to download resume.");
    } finally {
      setDownloading(false);
    }
  };

  const sections = [
    {
      title: "Technical questions",
      items: detail?.technicalQuestions || [],
    },
    {
      title: "Behavioral questions",
      items: detail?.behavioralQuestions || [],
    },
    {
      title: "Skill gaps",
      items: detail?.skillGaps || [],
    },
    {
      title: "Preparation plan",
      items: detail?.preparationPlan || [],
    },
  ];

  const renderItem = (item) => {
    if (item == null) {
      return null;
    }

    if (typeof item === "string") {
      return <p>{item}</p>;
    }

    if (typeof item === "object") {
      const question = item.question || item.title || "";
      const intention = item.intention || "";
      const answer = item.answer || item.tip || "";

      return (
        <div className="space-y-1">
          {question && <p className="font-medium">{question}</p>}
          {intention && (
            <p className="text-xs text-[color:var(--neo-muted)]">
              Intention: {intention}
            </p>
          )}
          {answer && <p>{answer}</p>}
        </div>
      );
    }

    return <p>{String(item)}</p>;
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl flex flex-col gap-8">
        <header className="neo-card p-6 md:p-8 flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--neo-muted)]">
                Report detail
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
                {detail?.title || "Interview report"}
              </h1>
              <p className="text-sm text-[color:var(--neo-muted)]">
                {detail?.createdAt
                  ? new Date(detail.createdAt).toLocaleString()
                  : "Generated report details"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="neo-button px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-[color:var(--neo-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--neo-bg)]"
                to="/"
              >
                Back to dashboard
              </Link>
              <Link
                className="neo-button px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-[color:var(--neo-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--neo-bg)]"
                to="/reports/new"
              >
                New report
              </Link>
              <button
                className="neo-button px-4 py-2 text-sm bg-[color:var(--neo-accent)] text-white focus-visible:ring-2 focus-visible:ring-[color:var(--neo-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--neo-bg)]"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? "Downloading..." : "Download resume PDF"}
              </button>
            </div>
          </div>
        </header>

        {detailStatus === "loading" && (
          <div className="neo-inset rounded-2xl px-5 py-4 text-sm text-[color:var(--neo-muted)]">
            Loading report details...
          </div>
        )}
        {detailStatus === "failed" && (
          <div className="neo-inset rounded-2xl px-5 py-4 text-sm text-red-600">
            {detailError}
          </div>
        )}
        {downloadError && (
          <div className="neo-inset rounded-2xl px-5 py-4 text-sm text-red-600">
            {downloadError}
          </div>
        )}

        {detailStatus === "succeeded" && detail && (
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <section className="neo-card p-6 md:p-8 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="neo-inset rounded-full px-3 py-1 text-xs text-[color:var(--neo-muted)]">
                  Match score: {detail.matchScore ?? "--"}%
                </span>
                <span className="neo-inset rounded-full px-3 py-1 text-xs text-[color:var(--neo-muted)]">
                  Report ID: {detail._id}
                </span>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Job description</h2>
                <p className="mt-2 text-sm text-[color:var(--neo-muted)] whitespace-pre-line">
                  {detail.jobDescription || "No job description provided."}
                </p>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Self description</h2>
                <p className="mt-2 text-sm text-[color:var(--neo-muted)] whitespace-pre-line">
                  {detail.selfDescription || "No self description provided."}
                </p>
              </div>
            </section>

            <section className="neo-card p-6 md:p-8 flex flex-col gap-6">
              {sections.map((section) => (
                <div key={section.title}>
                  <h3 className="font-display text-lg font-bold">
                    {section.title}
                  </h3>
                  {section.items.length === 0 ? (
                    <p className="mt-2 text-sm text-[color:var(--neo-muted)]">
                      No items available yet.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2 text-sm text-[color:var(--neo-muted)]">
                      {section.items.map((item, index) => (
                        <li key={`${section.title}-${index}`}>
                          {renderItem(item)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default ReportDetailPage;
