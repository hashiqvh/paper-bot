import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  country: z.string().optional(),
  status: z.enum(["LEAD", "VERIFIED", "ACTIVE", "SUSPENDED"]).default("LEAD"),
  kycStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING"),
  accountType: z.string().optional().default("Client"),
  notes: z.string().optional(),
});

export type ClientData = z.infer<typeof clientSchema>;

