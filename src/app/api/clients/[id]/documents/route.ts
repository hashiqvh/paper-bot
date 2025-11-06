import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "documents");

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

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

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    const documents = await prisma.document.findMany({
      where: { clientId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, documents }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch documents",
      },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string || "KYC Document";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Document name is required" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    // Generate unique filename
    const fileExtension = file.name.split(".").pop() || "pdf";
    const fileName = `${id}-${Date.now()}.${fileExtension}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Convert File to Buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Store file path relative to public directory
    const fileUrl = `/uploads/documents/${fileName}`;

    const document = await prisma.document.create({
      data: {
        clientId: id,
        name,
        type,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        status: "Pending",
      },
    });

    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to upload document",
      },
      { status: 500 }
    );
  }
}

