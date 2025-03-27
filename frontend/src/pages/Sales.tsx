import { useNavigate } from "react-router-dom";

const Sales = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Sales Page</h1>
      <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
};

export default Sales;
