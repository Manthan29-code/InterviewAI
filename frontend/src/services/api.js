const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const buildHeaders = (body, headers = {}) => {
  if (body instanceof FormData) {
    return headers;
  }
  return {
    "Content-Type": "application/json",
    ...headers,
  };
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: buildHeaders(options.body, options.headers),
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJson && payload?.message ? payload.message : "Request failed";
    throw new Error(message);
  }

  return payload;
};

const requestBlob = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: buildHeaders(options.body, options.headers),
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();
    const message = isJson && payload?.message ? payload.message : "Request failed";
    throw new Error(message);
  }

  return response.blob();
};

export const api = {
  get: (path, options) => request(path, { method: "GET", ...options }),
  post: (path, body, options) =>
    request(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  getBlob: (path, options) => requestBlob(path, { method: "GET", ...options }),
};
