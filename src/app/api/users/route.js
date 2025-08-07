import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Fetch all users (admin view)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true,
        createdAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST: Create a new user (admin creation or signup logic)
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // assume it's hashed before sending here
        role: role || "USER",
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

// PUT: Update user info or block/unblock
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, name, role, isBlocked } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        role,
        isBlocked,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE: Remove a user by ID
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
