import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const register = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    req.login(newUser, (err) => {
      if (err) return res.status(500).json({ message: "Internal server error" });
      res.status(201).json({
        message: "User registered successfully",
        user: newUser,
        redirectUrl: `/user/${newUser.id}`,
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = (req, res) => {
  if (!req.user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful", user: req.user, redirectUrl: `/user/${req.user.id}` });
};

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};

export const guestLogin = async (req, res) => {
  try {
    const guestUser = await prisma.user.create({
      data: {
        username: `Guest_${Math.random().toString(36).substring(7)}`,
        isGuest: true,
      },
    });

    req.login(guestUser, (err) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }

      res.json({ userId: guestUser.id });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
