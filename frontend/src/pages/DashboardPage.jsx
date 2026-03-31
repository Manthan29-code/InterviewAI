import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReports } from "../store/reports.slice";
import TopBar from "../components/TopBar";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.reports);

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto max-w-6xl px-6 pb-16">
        <section className="neo-card p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">
                Interview reports
              </h2>
              <p className="text-sm text-[color:var(--neo-muted)]">
                Review the reports you have generated so far.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2">
              <button
                className="neo-button px-5 py-2 text-sm font-semibold opacity-70 cursor-not-allowed"
                disabled
                title="Report creation will be available soon."
              >
                Create report
              </button>
              <span className="text-xs text-[color:var(--neo-muted)]">
                Coming soon: resume upload and report generation.
              </span>
            </div>
          </div>
          {status === "loading" && (
            <div className="neo-inset rounded-2xl px-5 py-4 text-sm text-[color:var(--neo-muted)]">
              Loading reports...
            </div>
          )}
          {status === "failed" && (
            <div className="neo-inset rounded-2xl px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          )}
          {status === "succeeded" && items.length === 0 && (
            <div className="neo-inset rounded-2xl px-5 py-6 text-sm text-[color:var(--neo-muted)]">
              No reports yet. Create your first report when the upload flow goes
              live.
            </div>
          )}
          {items.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((report) => (
                <article key={report._id} className="neo-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg font-bold">
                        {report.title || "Interview report"}
                      </h3>
                      <p className="text-xs text-[color:var(--neo-muted)]">
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString()
                          : "Date unavailable"}
                      </p>
                    </div>
                    <span className="neo-inset rounded-full px-3 py-1 text-xs text-[color:var(--neo-muted)]">
                      {report.matchScore ?? "--"}% match
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
