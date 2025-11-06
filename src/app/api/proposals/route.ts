import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { ProposalStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const proposalSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  service: z.string().min(1, "Service is required"),
  fee: z.number().positive("Fee must be positive"),
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"]).default("DRAFT"),
  validUntil: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  notes: z.string().optional(),
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

    if (!user || user.role !== "ADMIN") {
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
    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: "insensitive" } },
        { service: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status && status !== "all") {
      where.status = status as ProposalStatus;
    }

    const [proposals, total] = await prisma.$transaction([
      prisma.proposal.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.proposal.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        proposals,
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
          error instanceof Error ? error.message : "Failed to fetch proposals",
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
    const data = proposalSchema.parse(body);

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

    const proposal = await prisma.proposal.create({
      data: {
        clientId: data.clientId,
        clientName: client.name,
        service: data.service,
        fee: data.fee,
        status: data.status,
        validUntil: data.validUntil,
        notes: data.notes,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, proposal }, { status: 201 });
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
          error instanceof Error ? error.message : "Failed to create proposal",
      },
      { status: 500 }
    );
  }
}

