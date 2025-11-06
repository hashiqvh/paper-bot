import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { walletSchema } from "@/lib/validations/settings";
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
      include: { company: { include: { wallets: true } } },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (!user.company) {
      return NextResponse.json({ success: true, wallets: [] }, { status: 200 });
    }

    return NextResponse.json(
      { success: true, wallets: user.company.wallets },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch wallets",
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
    let user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { company: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Ensure company exists (use upsert to handle race conditions)
    const company = await prisma.company.upsert({
      where: { userId: payload.userId },
      update: {},
      create: {
        userId: payload.userId,
        name: "Company",
      },
    });
    const companyId = company.id;

    const body = await request.json();
    const data = walletSchema.parse(body);

    // If this is set as primary, unset all other primary wallets
    if (data.isPrimary) {
      await prisma.walletAddress.updateMany({
        where: {
          companyId: companyId,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    const wallet = await prisma.walletAddress.create({
      data: {
        companyId: companyId,
        label: data.label,
        cryptocurrency: data.cryptocurrency,
        address: data.address,
        isPrimary: data.isPrimary || false,
      },
    });

    return NextResponse.json({ success: true, wallet }, { status: 201 });
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
          error instanceof Error ? error.message : "Failed to create wallet",
      },
      { status: 500 }
    );
  }
}
