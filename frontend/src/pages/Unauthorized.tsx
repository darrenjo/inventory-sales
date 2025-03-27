import { useEffect, useState } from "react";

const Unauthorized = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage(
      localStorage.getItem("unauthorizedMessage") || "Anda tidak memiliki izin."
    );
    localStorage.removeItem("unauthorizedMessage");
  }, []);

  return (
    <div>
      <h1>403 - Unauthorized</h1>
      <p>{message}</p>
      <a href="/">🔙 Kembali ke Home</a>
    </div>
  );
};

export default Unauthorized;
