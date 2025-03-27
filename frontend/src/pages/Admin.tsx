import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Admin Page</h1>
      <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
};

export default Admin;
