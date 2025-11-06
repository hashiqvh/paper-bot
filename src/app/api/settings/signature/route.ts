import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { existsSync } from 'fs';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'signatures');

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 2MB' },
        { status: 400 }
      );
    }

    // Get existing signature to delete old file
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { signature: true },
    });

    // Delete old signature file if exists
    if (user?.signature && user.signature.startsWith('/uploads/')) {
      const oldFilePath = join(process.cwd(), 'public', user.signature);
      try {
        if (existsSync(oldFilePath)) {
          await unlink(oldFilePath);
        }
      } catch (error) {
        console.error('Failed to delete old signature file:', error);
      }
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'png';
    const fileName = `${payload.userId}-${Date.now()}.${fileExtension}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Convert File to Buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Store file path relative to public directory
    const fileUrl = `/uploads/signatures/${fileName}`;

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: { signature: fileUrl },
      select: {
        id: true,
        signature: true,
      },
    });

    return NextResponse.json(
      { success: true, signature: updatedUser.signature },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to upload signature' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);

    // Get user's signature path before deleting
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { signature: true },
    });

    // Delete signature file if exists
    if (user?.signature && user.signature.startsWith('/uploads/')) {
      const filePath = join(process.cwd(), 'public', user.signature);
      try {
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (error) {
        console.error('Failed to delete signature file:', error);
      }
    }

    await prisma.user.update({
      where: { id: payload.userId },
      data: { signature: null },
    });

    return NextResponse.json(
      { success: true, message: 'Signature removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to remove signature' },
      { status: 500 }
    );
  }
}

