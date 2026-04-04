import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateRFQNumber } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const organisationId = (session.user as any).organisationId;
    const rfqs = await prisma.rfq.findMany({
      where: { project: { organisationId } },
      include: {
        project: true,
        quotes: { include: { supplier: true } },
        awardedTo: true,
        _count: { select: { items: true, quotes: true } }
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json(rfqs);
  } catch (error) {
    console.error("Error fetching RFQs:", error);
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
    const { projectId, title, description, category, requiredBy, deliveryAddress, notes, selectedSuppliers, items } = body;

    if (!projectId || !title || !category) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const rfqNumber = generateRFQNumber();

    const rfq = await prisma.rfq.create({
      data: {
        rfqNumber,
        projectId,
        title,
        description,
        category,
        requiredBy: requiredBy ? new Date(requiredBy) : null,
        deliveryAddress,
        notes,
        status: "DRAFT",
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            unit: item.unit,
            quantity: item.quantity,
            specs: item.specs
          }))
        }
      },
      include: { items: true }
    });

    if (selectedSuppliers && selectedSuppliers.length > 0) {
      for (const supplierId of selectedSuppliers) {
        await prisma.rfqQuote.create({
          data: {
            rfqId: rfq.id,
            supplierId,
            status: "PENDING"
          }
        });
      }
    }

    return NextResponse.json(rfq, { status: 201 });
  } catch (error) {
    console.error("Error creating RFQ:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}