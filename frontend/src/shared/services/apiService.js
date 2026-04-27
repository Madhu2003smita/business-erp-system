const apiUrl = import.meta.env.VITE_API_BASE_URL;

const handleApiCall = async (endPoint, method, data) => {
  try {
    const url = `${apiUrl}${endPoint}`;
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

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
