import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center px-6">
    <div className="neo-card p-10 text-center max-w-xl">
      <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--neo-muted)]">
        404
      </p>
      <h1 className="font-display text-4xl font-bold mt-2">Page not found</h1>
      <p className="mt-3 text-sm text-[color:var(--neo-muted)]">
        The page you are looking for does not exist.
      </p>
      <Link className="neo-button inline-flex mt-6 px-6 py-2 text-sm" to="/">
        Back to dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;
