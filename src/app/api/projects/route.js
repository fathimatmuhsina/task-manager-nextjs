import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      include: {
        tasks: true,
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession({ req, ...authOptions });

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body?.name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const { name, description, color, status = "ACTIVE" } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingProject = await prisma.project.findFirst({
      where: {
        name,
        userId: user.id,
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "Project name already exists" },
        { status: 409 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color,
        status,
        user: {
          connect: { id: user.id },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("API Error - Create Project:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}



export async function PUT(req) {
  try {
    const { id, name, description, color, status } = await req.json();

    if (!id) {
      return NextResponse.json(
        { errors: { id: "Project ID is required" } },
        { status: 400 }
      );
    }

    const existing = await prisma.project.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { errors: { id: "Project not found" } },
        { status: 404 }
      );
    }

    // Check for name conflict with other projects of same user
    const duplicate = await prisma.project.findFirst({
      where: {
        name,
        userId: existing.userId,
        NOT: { id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          errors: {
            name: "Project name already exists",
          },
        },
        { status: 400 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { name, description, color, status },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { errors: { submit: "Failed to update project" } },
      { status: 500 }
    );
  }
}



// ✅ DELETE: Delete a project
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Project deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
