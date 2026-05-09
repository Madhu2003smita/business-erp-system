const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/";

const buildUrl = (endPoint) => {
  const base = apiUrl.replace(/\/+$/, "");
  const path = String(endPoint || "").replace(/^\/+/, "");
  return `${base}/${path}`;
};

const handleApiCall = async (endPoint, method, data, requiresAuth = false) => {
  try {
    const url = buildUrl(endPoint);
    const headers = { "Content-Type": "application/json" };

    if (requiresAuth) {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token missing");
      }
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Something went wrong");
    }

    return result;
  } catch (err) {
    console.log("err", err);
    throw err;
  }
};

export default handleApiCall;
