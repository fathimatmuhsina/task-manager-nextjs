import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// GET: Fetch a single task by ID
export async function GET(req, { params }) {
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

    const task = await prisma.task.findFirst({
      where: { 
        id: params.id,
        userId: user.id // Ensure user can only access their own tasks
      },
      include: {
        project: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

// PUT: Update a task by ID
export async function PUT(req, { params }) {
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
    const { title, description, status, priority, dueDate, projectId } = body;

    // Verify the task exists and belongs to the user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Validate required fields
    if (!title || !projectId) {
      return NextResponse.json({ error: "Title and project are required" }, { status: 400 });
    }

    // Check for duplicate title in the same project (excluding current task)
    if (title !== existingTask.title || projectId !== existingTask.projectId) {
      const duplicateTask = await prisma.task.findFirst({
        where: {
          title: title.trim(),
          projectId: projectId,
          userId: user.id,
          NOT: {
            id: params.id, // Exclude current task
          },
        },
      });

      if (duplicateTask) {
        return NextResponse.json(
          { error: "Task name already exists in this project" },
          { status: 400 }
        );
      }
    }

    const updateData = {
      title: title.trim(),
      description: description?.trim() || null,
      status,
      priority,
      projectId,
      dueDate: dueDate ? new Date(dueDate) : null,
    };

    // Set completedAt if status is changing to COMPLETED
    if (status === 'COMPLETED' && existingTask.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
    } else if (status !== 'COMPLETED') {
      updateData.completedAt = null;
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        project: true,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("PUT /api/tasks/[id] error:", error);
    
    if (error.code === 'P2002' && error.meta?.target?.includes('title_projectId')) {
      return NextResponse.json(
        { error: "Task name already exists in this project" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE: Delete a task by ID
export async function DELETE(req, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const taskId = params.id;

    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}