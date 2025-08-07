import prisma from "@/lib/prisma";
import { sendResetEmail } from "@/lib/mail";
import { randomBytes } from "crypto";

export async function POST(req) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.resetToken.create({
    data: { email, token, expiresAt },
  });

  await sendResetEmail(email, token);

  return Response.json({ message: "Reset email sent" });
}
