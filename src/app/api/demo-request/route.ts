import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, contactName, email, phone, message } = body;

    if (!companyName || !contactName || !email) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const demoRequest = await prisma.demoRequest.create({
      data: {
        companyName,
        contactName,
        email,
        phone,
        message,
        status: "pending"
      }
    });

    return NextResponse.json(demoRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating demo request:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const demoRequests = await prisma.demoRequest.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(demoRequests);
  } catch (error) {
    console.error("Error fetching demo requests:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}