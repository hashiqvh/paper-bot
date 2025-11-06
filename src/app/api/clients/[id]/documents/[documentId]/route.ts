import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
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

    const { id, documentId } = await params;
    const body = await request.json();

    // Verify document belongs to client
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        clientId: id,
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        name: body.name || document.name,
        type: body.type || document.type,
        status: body.status || document.status,
      },
    });

    return NextResponse.json(
      { success: true, document: updatedDocument },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update document",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
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

    const { id, documentId } = await params;

    // Verify document belongs to client
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        clientId: id,
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete file from filesystem if it exists
    if (document.fileUrl && document.fileUrl.startsWith("/uploads/")) {
      const filePath = join(process.cwd(), "public", document.fileUrl);
      try {
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (error) {
        console.error("Failed to delete document file:", error);
      }
    }

    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json(
      { success: true, message: "Document deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete document",
      },
      { status: 500 }
    );
  }
}

