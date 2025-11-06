import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify wallet belongs to user's company
    const wallet = await prisma.walletAddress.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!wallet || wallet.company.userId !== payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      );
    }

    await prisma.walletAddress.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: 'Wallet deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete wallet' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Verify wallet belongs to user's company
    const wallet = await prisma.walletAddress.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!wallet || wallet.company.userId !== payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // If setting as primary, unset all other primary wallets
    if (body.isPrimary) {
      await prisma.walletAddress.updateMany({
        where: {
          companyId: wallet.companyId,
          isPrimary: true,
          id: { not: id },
        },
        data: { isPrimary: false },
      });
    }

    const updatedWallet = await prisma.walletAddress.update({
      where: { id },
      data: {
        isPrimary: body.isPrimary !== undefined ? body.isPrimary : wallet.isPrimary,
        label: body.label || wallet.label,
        cryptocurrency: body.cryptocurrency || wallet.cryptocurrency,
        address: body.address || wallet.address,
      },
    });

    return NextResponse.json({ success: true, wallet: updatedWallet }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update wallet' },
      { status: 500 }
    );
  }
}

