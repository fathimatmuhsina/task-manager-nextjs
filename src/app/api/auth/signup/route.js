import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check for existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // default role
      },
    });

    return Response.json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
