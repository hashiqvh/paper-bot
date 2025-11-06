import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

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

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Fetch invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Generate PDF using puppeteer
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3100';
    const invoiceUrl = `${baseUrl}/invoices/${id}/preview`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Set cookies for authentication
    if (accessToken) {
      const url = new URL(baseUrl);
      const domain = url.hostname === 'localhost' ? 'localhost' : url.hostname;
      
      await page.setCookie({
        name: 'accessToken',
        value: accessToken,
        domain: domain,
        path: '/',
      });
    }
    
    await page.goto(invoiceUrl, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for invoice content to be visible (client-side rendered)
    await page.waitForSelector('.invoice-document', { timeout: 10000 }).catch(() => {
      // If selector not found, continue anyway
    });
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    });

    await browser.close();

    // Return PDF as response
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${invoice.id.toUpperCase()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate PDF",
      },
      { status: 500 }
    );
  }
}

