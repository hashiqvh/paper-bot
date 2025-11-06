import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { getSmtpTransporter } from "@/lib/smtp";
import { NextRequest, NextResponse } from "next/server";

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
    const body = await request.json();
    const { emailContent, recipientEmail } = body;

    if (!emailContent || !recipientEmail) {
      return NextResponse.json(
        { success: false, error: "Email content and recipient email are required" },
        { status: 400 }
      );
    }

    // Fetch invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        lineItems: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Get SMTP transporter
    const transporter = await getSmtpTransporter();
    const smtpSettings = await prisma.smtpSettings.findFirst();
    if (!smtpSettings) {
      return NextResponse.json(
        { success: false, error: "SMTP settings not configured. Please configure SMTP settings first." },
        { status: 400 }
      );
    }

    // Generate PDF
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3100';
    const pdfUrl = `${baseUrl}/api/invoices/${id}/pdf`;
    
    // Fetch PDF as buffer
    const pdfResponse = await fetch(pdfUrl, {
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
    });

    if (!pdfResponse.ok) {
      throw new Error("Failed to generate PDF");
    }

    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

    // Send email with PDF attachment
    const mailOptions = {
      from: `"${smtpSettings.fromName}" <${smtpSettings.fromEmail}>`,
      to: recipientEmail,
      subject: `Invoice ${invoice.id.toUpperCase()} - ${invoice.clientName}`,
      html: emailContent.replace(/\n/g, '<br>'), // Convert newlines to HTML breaks
      attachments: [
        {
          filename: `Invoice-${invoice.id.toUpperCase()}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // Update invoice status if needed
    // You might want to add a "sent" status or track when it was sent

    return NextResponse.json(
      { success: true, message: "Invoice sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending invoice email:", error);
    
    // Provide more helpful error messages
    let errorMessage = "Failed to send invoice email";
    if (error instanceof Error) {
      if (error.message.includes("wrong version number") || error.message.includes("SSL")) {
        errorMessage = "SMTP SSL/TLS configuration error. Please check your SMTP settings - port 587 requires STARTTLS (secure: false), port 465 requires direct SSL (secure: true).";
      } else if (error.message.includes("authentication")) {
        errorMessage = "SMTP authentication failed. Please check your username and password.";
      } else if (error.message.includes("ECONNREFUSED") || error.message.includes("ETIMEDOUT")) {
        errorMessage = "Could not connect to SMTP server. Please check your host and port settings.";
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

