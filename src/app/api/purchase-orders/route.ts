import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generatePONumber } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const organisationId = (session.user as any).organisationId;
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: { project: { organisationId } },
      include: { project: true, supplier: true, items: true, _count: { select: { deliveries: true } } },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error("Error fetching POs:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { projectId, supplierId, rfqId, deliveryAddress, billingAddress, paymentTerms, requiredDate, notes, items, subtotal, vatAmount, totalAmount } = body;

    if (!projectId || !supplierId) {
      return NextResponse.json({ message: "Project and supplier are required" }, { status: 400 });
    }

    const poNumber = generatePONumber();

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        projectId,
        supplierId,
        rfqId: rfqId || null,
        deliveryAddress,
        billingAddress,
        paymentTerms,
        requiredDate: requiredDate ? new Date(requiredDate) : null,
        notes,
        subtotal,
        vatAmount,
        totalAmount,
        status: "DRAFT",
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }))
        }
      },
      include: { items: true }
    });

    return NextResponse.json(po, { status: 201 });
  } catch (error) {
    console.error("Error creating PO:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}