import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true,role:true,createdAt:true },
  });

  return Response.json(user);
}

export async function PUT(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { name, password } = await req.json();

  const updateData = {};
  if (name) updateData.name = name;
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updateData.password = hashedPassword;
  }

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: updateData,
    select: { id: true, name: true, email: true },
  });

  return Response.json({ message: "Profile updated", user: updatedUser });
}
