import { encrypt } from "@/lib/encryption";
import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { smtpSettingsSchema } from "@/lib/validations/settings";
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

    let settings = await prisma.smtpSettings.findFirst();
    if (!settings) {
      return NextResponse.json(
        { success: true, settings: null },
        { status: 200 }
      );
    }

    // Don't return the password in the response
    const { password, ...settingsWithoutPassword } = settings;

    return NextResponse.json(
      { success: true, settings: settingsWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch SMTP settings",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const data = smtpSettingsSchema.parse(body);

    let settings = await prisma.smtpSettings.findFirst();
    
    // Prepare update data
    const updateData: any = {
      host: data.host,
      port: data.port,
      secure: data.secure,
      username: data.username,
      fromEmail: data.fromEmail,
      fromName: data.fromName,
      updatedBy: payload.userId,
    };

    // Only update password if provided (not empty)
    if (data.password && data.password.trim() !== "") {
      // Encrypt the password before storing
      updateData.password = encrypt(data.password);
    }
    
    if (!settings) {
      // Create new SMTP settings - password is required for new settings
      if (!data.password || data.password.trim() === "") {
        return NextResponse.json(
          { success: false, error: "Password is required for new SMTP settings" },
          { status: 400 }
        );
      }
      updateData.password = encrypt(data.password);
      
      settings = await prisma.smtpSettings.create({
        data: updateData,
      });
    } else {
      // Update existing SMTP settings - only update password if provided
      settings = await prisma.smtpSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    // Don't return the password in the response
    const { password, ...settingsWithoutPassword } = settings;

    return NextResponse.json(
      { success: true, settings: settingsWithoutPassword },
      { status: 200 }
    );
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
          error instanceof Error ? error.message : "Failed to update SMTP settings",
      },
      { status: 500 }
    );
  }
}

