import express from "express";
import { body } from "express-validator";
import { handleValidationErrors } from "../utils/handleValidationErrors.js";
import { register, login, logout, guestLogin } from "../controllers/authController.js";
import passport from "../config/passport.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Must be a valid email").normalizeEmail(),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long")
      .trim(),
    body("username").not().isEmpty().withMessage("Username is required").trim().escape(),
  ],
  handleValidationErrors,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Must be a valid email").normalizeEmail(),
    body("password").not().isEmpty().withMessage("Password is required").trim(),
  ],
  handleValidationErrors,
  (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Internal server error" });
        }
        return login(req, res);
      });
    })(req, res, next);
  }
);

router.get("/logout", logout);
router.post("/guest-login", guestLogin);

export default router;
