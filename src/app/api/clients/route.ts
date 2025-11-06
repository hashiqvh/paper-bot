import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations/clients";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const country = searchParams.get("country") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (country && country !== "all") {
      where.country = country;
    }

    // Build orderBy clause
    const orderBy: any = {};
    const validSortFields = ["name", "email", "country", "status", "kycStatus", "createdAt", "updatedAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    orderBy[sortField] = sortOrder === "asc" ? "asc" : "desc";

    // Get clients with pagination
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    // Get unique countries for filter
    const countries = await prisma.client.findMany({
      select: { country: true },
      distinct: ["country"],
    });

    return NextResponse.json(
      {
        success: true,
        clients,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        filters: {
          countries: countries
            .map((c) => c.country)
            .filter((country): country is string => Boolean(country) && country !== ""),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch clients",
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
    const data = clientSchema.parse(body);

    // Check if client with same email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email: data.email },
    });

    if (existingClient) {
      return NextResponse.json(
        { success: false, error: "Client with this email already exists" },
        { status: 409 }
      );
    }

    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        country: data.country || "",
        status: data.status,
        kycStatus: data.kycStatus,
        accountType: data.accountType || "Client",
        notes: data.notes,
      },
    });

    return NextResponse.json({ success: true, client }, { status: 201 });
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
          error instanceof Error ? error.message : "Failed to create client",
      },
      { status: 500 }
    );
  }
}

