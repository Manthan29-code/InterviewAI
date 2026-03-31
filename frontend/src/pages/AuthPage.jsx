import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearAuthError, loginUser, registerUser } from "../store/auth.slice";

const AuthPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, status, error } = useSelector((state) => state.auth);
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    dispatch(clearAuthError());

    if (mode === "register") {
      dispatch(registerUser(formData));
    } else {
      dispatch(loginUser({
        email: formData.email,
        password: formData.password,
      }));
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <section className="neo-card p-8 md:p-12 flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--neo-muted)]">
              Welcome to InterviewAI
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
              Train smarter for your next interview
            </h1>
          </div>
          <p className="text-[color:var(--neo-muted)]">
            Securely store your interview reports, track readiness, and see
            personalized improvements.
          </p>
          <div className="neo-inset-deep rounded-[28px] p-6 float-slow">
            <p className="text-sm font-medium">What you can do next:</p>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--neo-muted)]">
              <li>Log in or create an account in seconds.</li>
              <li>Review all generated interview reports.</li>
              <li>Prepare your next resume upload workflow.</li>
            </ul>
          </div>
        </section>
        <section className="neo-card p-8 md:p-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold">
                {mode === "register" ? "Create account" : "Welcome back"}
              </h2>
              <p className="text-sm text-[color:var(--neo-muted)]">
                {mode === "register"
                  ? "Get started with a few details."
                  : "Log in to continue."}
              </p>
            </div>
            <button
              className="neo-button px-4 py-2 text-xs uppercase tracking-[0.3em]"
              onClick={() => setMode(mode === "register" ? "login" : "register")}
            >
              {mode === "register" ? "Login" : "Register"}
            </button>
          </div>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            {mode === "register" && (
              <label className="flex flex-col gap-2 text-sm font-medium">
                Username
                <input
                  className="neo-input px-4 py-3"
                  name="username"
                  value={formData.username}
                  onChange={onChange}
                  required
                  placeholder="Your name"
                />
              </label>
            )}
            <label className="flex flex-col gap-2 text-sm font-medium">
              Email
              <input
                className="neo-input px-4 py-3"
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                required
                placeholder="you@example.com"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Password
              <input
                className="neo-input px-4 py-3"
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                required
                placeholder="••••••••"
              />
            </label>
            {error && (
              <div className="neo-inset rounded-2xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <button
              className="neo-button px-6 py-3 font-semibold"
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading"
                ? "Processing..."
                : mode === "register"
                ? "Create account"
                : "Login"}
            </button>
          </form>
          <div className="mt-6 text-xs text-[color:var(--neo-muted)]">
            <p>
              By continuing, you agree to keep your credentials safe. Need help?
              <Link className="ml-2 underline" to="/login">
                Contact support
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AuthPage;
