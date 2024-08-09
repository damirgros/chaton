import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const register = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log(`User already exists with email: ${email}`);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Password hashed successfully for user: ${username}`);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });
    console.log(`New user created: ${newUser.username} with ID: ${newUser.id}`);

    // Log the user in after registration
    req.login(newUser, (err) => {
      if (err) {
        console.error("Error during req.login:", err);
        return res.status(500).json({ message: "Internal server error during login" });
      }
      res.status(201).json({
        message: "User registered successfully",
        user: newUser,
        redirectUrl: `/user/${newUser.id}`,
      });
    });
  } catch (error) {
    console.error("Internal server error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
