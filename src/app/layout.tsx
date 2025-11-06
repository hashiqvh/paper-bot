import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ExpenseCategoriesProvider } from "@/contexts/ExpenseCategoriesContext";
import { QueryProvider } from "@/providers/QueryProvider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forex CRM",
  description: "User Authentication and Profiles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            <ExpenseCategoriesProvider>
              {children}
              <Toaster />
            </ExpenseCategoriesProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

