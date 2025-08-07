import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// GET: Fetch tasks for logged-in user
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json([], { status: 401 }); // return empty array if not logged in
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json([], { status: 404 }); // empty if user not found
    }

    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      include: {
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json([], { status: 500 }); // safe fallback
  }
}

// POST: Create a new task
export async function POST(req) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, status = "TODO", priority = "MEDIUM", projectId, dueDate } = body;

    if (!title || !projectId) {
      return NextResponse.json({ error: "Title and project are required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status,
        priority,
        userId: user.id,
        projectId,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
return NextResponse.json({ error: error.message || "Failed to create task" }, { status: 500 });

    if (error.code === 'P2002' && error.meta?.target?.includes('title_projectId')) {
      return NextResponse.json(
        { error: "Task name already exists in this project" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: error.message || "Failed to create task" }, { status: 500 });
  }
}