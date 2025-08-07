import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        dueDate: true,
        completedAt: true,
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(tasks);
  } catch (err) {
    console.error("GET /api/report error:", err);
    return NextResponse.json(
      { error: "Failed to fetch task report" },
      { status: 500 }
    );
  }
}
