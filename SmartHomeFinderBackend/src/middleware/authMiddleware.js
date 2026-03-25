import jwt from "jsonwebtoken";


export const protect = (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorised, token missing" });
  }

  try {

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server config error" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();

  } catch (err) {
    return res.status(401).json({ message: "Not authorised, invalid token" });
  }
};


export const isLandlord = (req, res, next) => {
  if (req.user && req.user.role === "landlord") {
    next();
  } else {
    return res.status(403).json({ message: "Forbidden, landlord access only" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Forbidden, admin access only" });
  }
};
