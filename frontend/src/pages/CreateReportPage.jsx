import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { createReport } from "../store/reports.slice";

const MAX_FILE_SIZE = 3 * 1024 * 1024;

const CreateReportPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { createStatus, createError } = useSelector((state) => state.reports);
  const [localError, setLocalError] = useState(null);
  const [formData, setFormData] = useState({
    resume: null,
    selfDescription: "",
    jobDescription: "",
  });

  const onFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (file && file.size > MAX_FILE_SIZE) {
      setLocalError("Resume file must be under 3 MB.");
    } else {
      setLocalError(null);
    }
    setFormData((prev) => ({
      ...prev,
      resume: file,
    }));
  };

  const onChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLocalError(null);

    if (!formData.resume) {
      setLocalError("Please upload a PDF resume.");
      return;
    }

    if (formData.resume.size > MAX_FILE_SIZE) {
      setLocalError("Resume file must be under 3 MB.");
      return;
    }

    const payload = new FormData();
    payload.append("resume", formData.resume);
    payload.append("selfDescription", formData.selfDescription);
    payload.append("jobDescription", formData.jobDescription);

    try {
      const response = await dispatch(createReport(payload)).unwrap();
      const reportId = response?.interviewReport?._id;
      if (reportId) {
        navigate(`/reports/${reportId}`);
      } else {
        navigate("/");
      }
    } catch (error) {
      setLocalError(
        typeof error === "string" ? error : error?.message || "Failed to create report."
      );
    }
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl flex flex-col gap-8">
        <header className="neo-card p-6 md:p-8 flex flex-col gap-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--neo-muted)]">
                New report
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
                Generate an interview report
              </h1>
            </div>
            <Link
              className="neo-button px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-[color:var(--neo-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--neo-bg)]"
              to="/"
            >
              Back to dashboard
            </Link>
          </div>
          <p className="text-sm text-[color:var(--neo-muted)]">
            Upload a PDF resume and share the role and background details so the
            AI can generate your interview prep plan.
          </p>
        </header>

        <section className="neo-card p-6 md:p-8">
          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Resume (PDF only, max 3 MB)
              <input
                className="neo-input px-4 py-3 focus-visible:ring-2 focus-visible:ring-[color:var(--neo-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--neo-bg)]"
                type="file"
                accept="application/pdf"
                onChange={onFileChange}
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Self description
              <textarea
                className="neo-input px-4 py-3 min-h-[140px] focus-visible:ring-2 focus-visible:ring-[color:var(--neo-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--neo-bg)]"
                name="selfDescription"
                value={formData.selfDescription}
                onChange={onChange}
                placeholder="Share your strengths, goals, and experience."
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Job description
              <textarea
                className="neo-input px-4 py-3 min-h-[140px] focus-visible:ring-2 focus-visible:ring-[color:var(--neo-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--neo-bg)]"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={onChange}
                placeholder="Paste the role description or responsibilities."
                required
              />
            </label>

            {(localError || createError) && (
              <div className="neo-inset rounded-2xl px-4 py-3 text-sm text-red-600">
                {localError || createError}
              </div>
            )}

            <button
              className="neo-button px-6 py-3 font-semibold bg-[color:var(--neo-accent)] text-white focus-visible:ring-2 focus-visible:ring-[color:var(--neo-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--neo-bg)]"
              type="submit"
              disabled={createStatus === "loading"}
            >
              {createStatus === "loading" ? "Generating..." : "Generate report"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default CreateReportPage;
