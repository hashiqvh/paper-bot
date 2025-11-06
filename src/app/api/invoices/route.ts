import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  taxRate: z.number().min(0).max(100).optional().default(20),
  dueDate: z.string().min(1, "Due date is required").transform((val) => new Date(val)),
  issueDate: z.string().optional().transform((val) => (val ? new Date(val) : new Date())),
  status: z.enum(["PAID", "UNPAID", "OVERDUE", "UPCOMING"]).default("UNPAID"),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
  lineItems: z.array(
    z.object({
      description: z.string().min(1, "Description is required"),
      amount: z.number().positive("Amount must be positive"),
    })
  ).min(1, "At least one line item is required"),
});

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};
    
    // If user is a client, only show their invoices
    if (user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { email: user.email },
      });
      if (client) {
        where.clientId = client.id;
      } else {
        return NextResponse.json(
          { success: true, invoices: [], pagination: { total: 0, page: 1, limit, totalPages: 0 } },
          { status: 200 }
        );
      }
    }

    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
        { lineItems: { some: { description: { contains: search, mode: "insensitive" } } } },
      ];
    }
    if (status && status !== "all") {
      where.status = status as InvoiceStatus;
    }

    const [invoices, total] = await prisma.$transaction([
      prisma.invoice.findMany({
        where,
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
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        invoices,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch invoices",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const data = invoiceSchema.parse(body);

    // Get client name
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
      select: { name: true },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    // Calculate totals
    const subtotal = data.lineItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = (subtotal * (data.taxRate || 0)) / 100;
    const total = subtotal + tax;

    const invoice = await prisma.invoice.create({
      data: {
        clientId: data.clientId,
        clientName: client.name,
        subtotal,
        taxRate: data.taxRate || 20,
        tax,
        total,
        status: data.status,
        dueDate: data.dueDate,
        issueDate: data.issueDate || new Date(),
        notes: data.notes,
        paymentTerms: data.paymentTerms,
        lineItems: {
          create: data.lineItems.map((item) => ({
            description: item.description,
            amount: item.amount,
          })),
        },
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

    return NextResponse.json({ success: true, invoice }, { status: 201 });
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
          error instanceof Error ? error.message : "Failed to create invoice",
      },
      { status: 500 }
    );
  }
}

