import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const organisationId = (session.user as any).organisationId;
    const contractors = await prisma.contractor.findMany({
      where: { organisationId },
      include: {
        _count: { select: { projects: true, documents: true } },
        performanceRatings: true
      },
      orderBy: { companyName: "asc" }
    });

    return NextResponse.json(contractors);
  } catch (error) {
    console.error("Error fetching contractors:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const organisationId = (session.user as any).organisationId;
    const body = await request.json();
    const {
      companyName, email, phone, address, city,
      cidbGrade, cidbNumber, cidbExpiry,
      taxClearanceExpiry, beeCertificateExpiry, beeLevel,
      publicLiabilityExpiry, publicLiabilityValue
    } = body;

    if (!companyName || !email) {
      return NextResponse.json({ message: "Company name and email are required" }, { status: 400 });
    }

    const contractor = await prisma.contractor.create({
      data: {
        companyName,
        email,
        phone,
        address,
        city,
        cidbGrade,
        cidbNumber,
        cidbExpiry: cidbExpiry ? new Date(cidbExpiry) : null,
        taxClearanceExpiry: taxClearanceExpiry ? new Date(taxClearanceExpiry) : null,
        beeCertificateExpiry: beeCertificateExpiry ? new Date(beeCertificateExpiry) : null,
        beeLevel,
        publicLiabilityExpiry: publicLiabilityExpiry ? new Date(publicLiabilityExpiry) : null,
        publicLiabilityValue: publicLiabilityValue || 0,
        organisationId,
        status: "ACTIVE"
      }
    });

    return NextResponse.json(contractor, { status: 201 });
  } catch (error) {
    console.error("Error creating contractor:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}