import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { token, newPassword } = await req.json();

  const reset = await prisma.resetToken.findUnique({ where: { token } });

  if (!reset || reset.expiresAt < new Date()) {
    return Response.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email: reset.email },
    data: { password: hashedPassword },
  });

  await prisma.resetToken.delete({ where: { token } });

  return Response.json({ message: "Password updated successfully" });
}
