// Admin Role Middleware
// Runs AFTER authMiddleware — checks if the logged-in user is an admin
const adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = adminMiddleware;
