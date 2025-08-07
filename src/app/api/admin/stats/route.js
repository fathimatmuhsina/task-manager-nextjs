// File: src/app/api/admin/dashboard/route.js
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all users with their projects and tasks
    const users = await prisma.user.findMany({
      include: {
        projects: {
          include: {
            tasks: true,
          },
        },
        tasks: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
