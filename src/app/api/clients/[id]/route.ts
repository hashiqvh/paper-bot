import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations/clients";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        proposals: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        agreements: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        documents: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        expenses: {
          orderBy: { date: "desc" },
          take: 10,
        },
        clientNotes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, client }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch client",
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
    const data = clientSchema.partial().parse(body);

    // Check if email is being updated and if it's already taken
    if (data.email) {
      const existingClient = await prisma.client.findUnique({
        where: { email: data.email },
      });

      if (existingClient && existingClient.id !== id) {
        return NextResponse.json(
          { success: false, error: "Client with this email already exists" },
          { status: 409 }
        );
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, client }, { status: 200 });
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
          error instanceof Error ? error.message : "Failed to update client",
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

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Client deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete client",
      },
      { status: 500 }
    );
  }
}

