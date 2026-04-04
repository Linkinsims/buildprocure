import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const organisationId = (session.user as any).organisationId;
    const projects = await prisma.project.findMany({
      where: { organisationId },
      include: {
        budgets: true,
        _count: { select: { rfqs: true, purchaseOrders: true, deliveries: true } }
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const organisationId = (session.user as any).organisationId;
    const body = await request.json();
    const { name, code, description, city, location, address, startDate, endDate, estimatedValue, cidbGrade } = body;

    if (!name || !code) {
      return NextResponse.json({ message: "Name and code are required" }, { status: 400 });
    }

    const existingProject = await prisma.project.findUnique({
      where: { code }
    });

    if (existingProject) {
      return NextResponse.json({ message: "Project code already exists" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        code,
        description,
        city,
        location,
        address,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        estimatedValue: estimatedValue || 0,
        cidbGrade,
        organisationId,
        status: "PLANNING",
      }
    });

    await prisma.budget.create({
      data: {
        projectId: project.id,
        totalBudget: estimatedValue || 0,
        committed: 0,
        actual: 0
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}