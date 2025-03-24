import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  // console.log("Cookies received:", req.cookies);

  const token = req.cookies.token;
  if (!token)
    return res
      .status(401)
      .json({ error: "Access token is missing or invalid" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Token decoded:", verified);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: "Access token is invalid" });
  }
};

export const authorizeRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};
