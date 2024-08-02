export const ensureAuthenticated = (req, res, next) => {
  if (
    req.isAuthenticated() ||
    (req.user && req.user.username && req.user.username.includes("Guest"))
  ) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
