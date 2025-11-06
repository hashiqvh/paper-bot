import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateInvoiceSchema = z.object({
  taxRate: z.number().min(0).max(100).optional(),
  dueDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  status: z.enum(["PAID", "UNPAID", "OVERDUE", "UPCOMING"]).optional(),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
  lineItems: z.array(
    z.object({
      id: z.string().optional(),
      description: z.string().min(1, "Description is required"),
      amount: z.number().positive("Amount must be positive"),
    })
  ).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            country: true,
          },
        },
        lineItems: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    // If user is a client, verify they own this invoice
    if (user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { email: user.email },
      });
      if (!client || invoice.clientId !== client.id) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, invoice }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch invoice",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateInvoiceSchema.parse(body);

    // Get existing invoice
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: { lineItems: true },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Calculate totals if line items are updated
    let subtotal = existingInvoice.subtotal || 0;
    let tax = existingInvoice.tax || 0;
    let total = existingInvoice.total;

    if (data.lineItems) {
      subtotal = data.lineItems.reduce((sum, item) => sum + item.amount, 0);
      const taxRate = data.taxRate ?? existingInvoice.taxRate ?? 20;
      tax = (subtotal * taxRate) / 100;
      total = subtotal + tax;

      // Delete existing line items and create new ones
      await prisma.invoiceLineItem.deleteMany({
        where: { invoiceId: id },
      });

      await prisma.invoiceLineItem.createMany({
        data: data.lineItems.map((item) => ({
          invoiceId: id,
          description: item.description,
          amount: item.amount,
        })),
      });
    } else if (data.taxRate !== undefined) {
      subtotal = existingInvoice.subtotal || 0;
      tax = (subtotal * data.taxRate) / 100;
      total = subtotal + tax;
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        taxRate: data.taxRate ?? existingInvoice.taxRate,
        dueDate: data.dueDate ?? existingInvoice.dueDate,
        status: data.status ?? existingInvoice.status,
        notes: data.notes ?? existingInvoice.notes,
        paymentTerms: data.paymentTerms ?? existingInvoice.paymentTerms,
        subtotal,
        tax,
        total,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lineItems: true,
      },
    });

    return NextResponse.json({ success: true, invoice }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update invoice",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Invoice deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete invoice",
      },
      { status: 500 }
    );
  }
}

