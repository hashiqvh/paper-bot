import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateNoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
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

    const { id, noteId } = await params;
    const body = await request.json();
    const data = updateNoteSchema.parse(body);

    // Verify note belongs to client
    const note = await prisma.clientNote.findFirst({
      where: {
        id: noteId,
        clientId: id,
      },
    });

    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }

    const updatedNote = await prisma.clientNote.update({
      where: { id: noteId },
      data: { content: data.content },
    });

    return NextResponse.json({ success: true, note: updatedNote }, { status: 200 });
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
          error instanceof Error ? error.message : "Failed to update note",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
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

    const { id, noteId } = await params;

    // Verify note belongs to client
    const note = await prisma.clientNote.findFirst({
      where: {
        id: noteId,
        clientId: id,
      },
    });

    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }

    await prisma.clientNote.delete({
      where: { id: noteId },
    });

    return NextResponse.json(
      { success: true, message: "Note deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete note",
      },
      { status: 500 }
    );
  }
}

