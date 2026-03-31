import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/auth.slice";

const TopBar = () => {
  const dispatch = useDispatch();
  const { user, status } = useSelector((state) => state.auth);

  return (
    <header className="w-full">
      <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--neo-muted)]">
            InterviewAI
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Your interview readiness hub
          </h1>
        </div>
        <div className="neo-card px-5 py-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <div>
            <p className="text-xs text-[color:var(--neo-muted)]">Signed in as</p>
            <p className="font-medium">{user?.username || "Candidate"}</p>
          </div>
          <button
            className="neo-button px-4 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-[color:var(--neo-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--neo-bg)]"
            onClick={() => dispatch(logoutUser())}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Signing out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
