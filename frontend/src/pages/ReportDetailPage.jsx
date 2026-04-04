import { useEffect, useState } from "react";
import { FaAlignLeft, FaAlignRight, FaColumns } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { fetchReportById } from "../store/reports.slice";
import {
  CollapsibleItem,
  CollapsibleSection,
} from "../components/CollapsibleSection";
import { api } from "../services/api";

const ReportDetailPage = () => {
  const dispatch = useDispatch();
  const { reportId } = useParams();
  const { detail, detailStatus, detailError } = useSelector(
    (state) => state.reports
  );
  const [downloadError, setDownloadError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [panelMode, setPanelMode] = useState("both");

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

  const technicalQuestions = detail?.technicalQuestions || [];
  const behavioralQuestions = detail?.behavioralQuestions || [];
  const skillGaps = detail?.skillGaps || [];
  const preparationPlan = detail?.preparationPlan || [];

  const getPreview = (value) => {
    if (!value) {
      return "";
    }
    const text = String(value).trim();
    if (text.length <= 120) {
      return text;
    }
    return `${text.slice(0, 120)}...`;
  };

  const getNextPanelMode = () => {
    if (panelMode === "left") {
      return "both";
    }
    if (panelMode === "both") {
      return "right";
    }
    return "left";
  };

  const handlePanelModeToggle = () => {
    setPanelMode(getNextPanelMode());
  };

  const nextPanelMode = getNextPanelMode();
  const panelModeLabel =
    panelMode === "left" ? "Left" : panelMode === "right" ? "Right" : "Both";
  const nextPanelModeLabel =
    nextPanelMode === "left"
      ? "Left"
      : nextPanelMode === "right"
        ? "Right"
        : "Both";

  const PanelModeIcon =
    panelMode === "left"
      ? FaAlignLeft
      : panelMode === "right"
        ? FaAlignRight
        : FaColumns;

  const desktopGridClass =
    panelMode === "both" ? "md:grid-cols-[1.2fr_0.8fr]" : "md:grid-cols-1";

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
              {detailStatus === "succeeded" && detail && (
                <button
                  className="neo-button hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-[color:var(--neo-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--neo-bg)]"
                  onClick={handlePanelModeToggle}
                  type="button"
                  aria-label={`Switch desktop view to ${nextPanelModeLabel}`}
                  title={`Desktop view: ${panelModeLabel}. Click to switch to ${nextPanelModeLabel}.`}
                >
                  <PanelModeIcon aria-hidden="true" />
                  <span>Desktop: {panelModeLabel}</span>
                </button>
              )}
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
          <div className={`grid gap-6 ${desktopGridClass}`}>
            <section
              className={`h-screen overflow-y-scroll hide-scrollbar neo-card p-6 md:p-8 flex flex-col gap-5 ${
                panelMode === "right" ? "md:hidden" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="neo-inset rounded-full px-3 py-1 text-xs text-[color:var(--neo-muted)]">
                  Match score: {detail.matchScore ?? "--"}%
                </span>
                <span className="neo-inset rounded-full px-3 py-1 text-xs text-[color:var(--neo-muted)]">
                  Report ID: {detail._id}
                </span>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold md:text-2xl">
                  Job description
                </h2>
                <p className="mt-2 text-sm text-[color:var(--neo-muted)] whitespace-pre-line leading-relaxed">
                  {detail.jobDescription || "No job description provided."}
                </p>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold md:text-2xl">
                  Self description
                </h2>
                <p className="mt-2 text-sm text-[color:var(--neo-muted)] whitespace-pre-line leading-relaxed">
                  {detail.selfDescription || "No self description provided."}
                </p>
              </div>
            </section>

            <section
              className={`h-screen overflow-y-scroll hide-scrollbar neo-card p-6 md:p-8 flex flex-col gap-4 ${
                panelMode === "left" ? "md:hidden" : ""
              }`}
            >
              <CollapsibleSection
                title="Technical questions"
                description="Questions to validate depth of technical experience."
                count={technicalQuestions.length}
                defaultCollapsed
              >
                {technicalQuestions.length === 0 ? (
                  <p className="text-sm text-[color:var(--neo-muted)]">
                    No technical questions available yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {technicalQuestions.map((item, index) => (
                      <CollapsibleItem
                        key={`technical-${index}`}
                        title={item.question || "Untitled question"}
                        meta={
                          item.intention
                            ? `Intention: ${item.intention}`
                            : ""
                        }
                        preview={getPreview(item.answer)}
                        defaultCollapsed
                      >
                        <p className="text-sm text-[color:var(--neo-muted)] leading-relaxed">
                          {item.answer || "No answer provided."}
                        </p>
                      </CollapsibleItem>
                    ))}
                  </div>
                )}
              </CollapsibleSection>

              <CollapsibleSection
                title="Behavioral questions"
                description="Communication and leadership checkpoints."
                count={behavioralQuestions.length}
                defaultCollapsed
              >
                {behavioralQuestions.length === 0 ? (
                  <p className="text-sm text-[color:var(--neo-muted)]">
                    No behavioral questions available yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {behavioralQuestions.map((item, index) => (
                      <CollapsibleItem
                        key={`behavioral-${index}`}
                        title={item.question || "Untitled question"}
                        meta={
                          item.intention
                            ? `Intention: ${item.intention}`
                            : ""
                        }
                        preview={getPreview(item.answer)}
                        defaultCollapsed
                      >
                        <p className="text-sm text-[color:var(--neo-muted)] leading-relaxed">
                          {item.answer || "No answer provided."}
                        </p>
                      </CollapsibleItem>
                    ))}
                  </div>
                )}
              </CollapsibleSection>

              <CollapsibleSection
                title="Skill gaps"
                description="Areas to improve before the interview."
                count={skillGaps.length}
                defaultCollapsed
              >
                {skillGaps.length === 0 ? (
                  <p className="text-sm text-[color:var(--neo-muted)]">
                    No skill gaps available yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {skillGaps.map((item, index) => (
                      <CollapsibleItem
                        key={`skill-${index}`}
                        title={item.skill || "Skill gap"}
                        meta={
                          item.severity
                            ? `Severity: ${item.severity}`
                            : ""
                        }
                        preview={
                          item.severity
                            ? `Priority: ${item.severity}`
                            : ""
                        }
                        defaultCollapsed
                      >
                        <div className="flex items-center gap-2">
                          <span className="neo-inset rounded-full px-3 py-1 text-xs text-[color:var(--neo-muted)]">
                            {item.severity || "Unrated"}
                          </span>
                          <span className="text-xs text-[color:var(--neo-muted)]">
                            Focus area
                          </span>
                        </div>
                      </CollapsibleItem>
                    ))}
                  </div>
                )}
              </CollapsibleSection>

              <CollapsibleSection
                title="Preparation plan"
                description="Daily plan to close gaps and build confidence."
                count={preparationPlan.length}
                defaultCollapsed
              >
                {preparationPlan.length === 0 ? (
                  <p className="text-sm text-[color:var(--neo-muted)]">
                    No preparation plan available yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {preparationPlan.map((item, index) => (
                      <CollapsibleItem
                        key={`plan-${index}`}
                        title={
                          item.day
                            ? `Day ${item.day}: ${item.focus || "Focus"}`
                            : item.focus || "Plan"
                        }
                        meta={item.focus ? `Focus: ${item.focus}` : ""}
                        preview={
                          Array.isArray(item.tasks)
                            ? getPreview(item.tasks[0])
                            : ""
                        }
                        defaultCollapsed
                      >
                        {Array.isArray(item.tasks) && item.tasks.length > 0 ? (
                          <ul className="space-y-2 text-sm text-[color:var(--neo-muted)]">
                            {item.tasks.map((task, taskIndex) => (
                              <li key={`task-${index}-${taskIndex}`}>
                                {task}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-[color:var(--neo-muted)]">
                            No tasks listed for this day.
                          </p>
                        )}
                      </CollapsibleItem>
                    ))}
                  </div>
                )}
              </CollapsibleSection>
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default ReportDetailPage;
