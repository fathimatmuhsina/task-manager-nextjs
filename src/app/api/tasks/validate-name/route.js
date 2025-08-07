import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, projectId, excludeId } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existingTask = await prisma.task.findFirst({
    where: {
      title,
      projectId,
      userId: user.id,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });

  return NextResponse.json({ exists: !!existingTask });
}
