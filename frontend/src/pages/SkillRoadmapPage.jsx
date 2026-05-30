import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TopBar from "../components/TopBar";
import RoadmapTaskList from "../components/mock/RoadmapTaskList";
import { fetchReports } from "../store/reports.slice";
import { fetchRoadmap, generateRoadmap, updateRoadmapTask } from "../store/roadmap.slice";

const SkillRoadmapPage = () => {
  const dispatch = useDispatch();
  const [reportId, setReportId] = useState("");

  const reportsState = useSelector((state) => state.reports);
  const roadmapState = useSelector((state) => state.roadmap);

  useEffect(() => {
    if (reportsState.status === "idle") {
      dispatch(fetchReports());
    }
  }, [dispatch, reportsState.status]);

  useEffect(() => {
    dispatch(fetchRoadmap(reportId || undefined));
  }, [dispatch, reportId]);

  const reportOptions = useMemo(() => {
    return reportsState.items.map((report) => ({
      id: report._id || report.id,
      title: report.title || report.jobTitle || "Interview Report",
    }));
  }, [reportsState.items]);

  const handleGenerate = () => {
    if (!reportId) return;
    dispatch(generateRoadmap(reportId));
  };

  const handleStatusChange = (task, status, roadmapId) => {
    dispatch(updateRoadmapTask({ roadmapId, taskId: task._id || task.id, status }));
  };

  return (
    <div className="min-h-screen bg-[color:var(--neo-bg)]">
      <TopBar />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-2">
            <h1 className="font-display text-3xl md:text-4xl font-extrabold">Skill Roadmap</h1>
            <p className="text-sm text-[color:var(--neo-muted)]">
              Follow your personalized learning tasks and track progress by skill.
            </p>
          </section>

          <section className="neo-card p-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-semibold text-[color:var(--neo-muted)]">Report</label>
                <select
                  value={reportId}
                  onChange={(event) => setReportId(event.target.value)}
                  className="neo-input px-4 py-2 text-sm"
                >
                  <option value="">All reports</option>
                  {reportOptions.map((report) => (
                    <option key={report.id} value={report.id}>{report.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  className="neo-button px-4 py-2 text-sm bg-[color:var(--neo-accent)] text-white w-full"
                  disabled={!reportId || roadmapState.generateStatus === "loading"}
                  onClick={handleGenerate}
                >
                  {roadmapState.generateStatus === "loading" ? "Generating..." : "Generate Roadmap"}
                </button>
              </div>
            </div>
            <p className="text-xs text-[color:var(--neo-muted)]">
              Select a report to generate new tasks, or view existing roadmaps.
            </p>
          </section>

          {roadmapState.status === "loading" && (
            <div className="neo-card p-6 animate-pulse">Loading roadmaps...</div>
          )}
          {roadmapState.status === "failed" && (
            <div className="neo-card p-6 text-sm text-red-400">{roadmapState.error}</div>
          )}

          {roadmapState.items.length === 0 && roadmapState.status === "succeeded" && (
            <div className="neo-card p-6 text-sm text-[color:var(--neo-muted)]">
              No roadmaps yet. Generate one from an interview report.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {roadmapState.items.map((roadmap) => (
              <RoadmapTaskList
                key={roadmap.id}
                roadmap={roadmap}
                isUpdating={roadmapState.updateStatus === "loading"}
                onStatusChange={(task, status) => handleStatusChange(task, status, roadmap.id)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SkillRoadmapPage;
