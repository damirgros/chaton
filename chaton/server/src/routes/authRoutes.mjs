import express from "express";
import { body } from "express-validator";
import { handleValidationErrors } from "../utils/handleValidationErrors.js";
import { register, login, logout } from "../controllers/authController.js";
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
    body("username").optional().trim().escape(),
  ],
  handleValidationErrors,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Must be a valid email").normalizeEmail(),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long")
      .trim(),
  ],
  handleValidationErrors,
  passport.authenticate("local"),
  login
);

router.get("/logout", logout);

export default router;
