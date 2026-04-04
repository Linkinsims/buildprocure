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
    const suppliers = await prisma.supplier.findMany({
      where: { organisationId },
      include: {
        _count: { select: { purchaseOrders: true, rfqQuotes: true } }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
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
    const { name, email, phone, address, city, vatRegistered, vatNumber, contactPerson } = body;

    if (!name || !email) {
      return NextResponse.json({ message: "Name and email are required" }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        address,
        city,
        vatRegistered: vatRegistered || false,
        vatNumber,
        contactPerson,
        organisationId
      }
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}