import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET - fetch all projects for the organisation
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    const projects = await prisma.project.findMany({
      where: { organisationId: user.organisationId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST - create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    const body = await request.json();
    const {
      name,
      code,
      description,
      sector,
      status,
      city,
      province,
      address,
      clientName,
      startDate,
      endDate,
      totalBudget,
      divisionId,
    } = body;

    if (!name || !code) {
      return NextResponse.json(
        { message: "Project name and code are required" },
        { status: 400 }
      );
    }

    // Check if code already exists in this org
    const existing = await prisma.project.findFirst({
      where: {
        code,
        organisationId: user.organisationId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Project code already exists" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        code,
        description: description || null,
        sector: sector || "RESIDENTIAL",
        status: status || "PLANNING",
        city: city || null,
        province: province || null,
        address: address || null,
        clientName: clientName || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        totalBudget: totalBudget ? parseFloat(totalBudget) : 0,
        organisationId: user.organisationId,
        divisionId: divisionId || null,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
