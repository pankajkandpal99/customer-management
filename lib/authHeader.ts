export const getAuthHeader = () => {
  if (typeof window !== "undefined") {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("jwt="))
      ?.split("=")[1];

    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};
