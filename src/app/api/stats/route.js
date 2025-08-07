// /app/api/stats/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();
    const totalProjects = await prisma.project.count();
    const totalTasks = await prisma.task.count();

    return NextResponse.json({ totalUsers, totalProjects, totalTasks });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
