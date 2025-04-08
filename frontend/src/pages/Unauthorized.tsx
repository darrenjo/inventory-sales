import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Unauthorized Page</h1>
      <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
};

export default Unauthorized;
