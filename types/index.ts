import { Database } from "./database";

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];
export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type WorkspaceMember = Database["public"]["Tables"]["workspace_members"]["Row"];
export type Department = Database["public"]["Tables"]["departments"]["Row"];
export type DepartmentMember = Database["public"]["Tables"]["department_members"]["Row"];
export type Invite = Database["public"]["Tables"]["invites"]["Row"];
export type Plan = Database["public"]["Tables"]["plans"]["Row"];
export type OrganizationSubscription = Database["public"]["Tables"]["organization_subscriptions"]["Row"];
export type CreditWallet = Database["public"]["Tables"]["credit_wallets"]["Row"];
export type CreditLedger = Database["public"]["Tables"]["credit_ledger"]["Row"];
export type WhatsAppAccount = Database["public"]["Tables"]["whatsapp_accounts"]["Row"];
export type WhatsAppNumber = Database["public"]["Tables"]["whatsapp_numbers"]["Row"];
export type WhatsAppTemplate = Database["public"]["Tables"]["whatsapp_templates"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
export type CampaignMessage = Database["public"]["Tables"]["campaign_messages"]["Row"];
export type StripeCustomer = Database["public"]["Tables"]["stripe_customers"]["Row"];
export type StripeSubscription = Database["public"]["Tables"]["stripe_subscriptions"]["Row"];
export type StripeInvoice = Database["public"]["Tables"]["stripe_invoices"]["Row"];
export type StripeEvent = Database["public"]["Tables"]["stripe_events"]["Row"];

export type OrganizationRole = "owner" | "admin";
export type WorkspaceRole = "admin" | "manager" | "agent" | "viewer";
export type DepartmentRole = "manager" | "agent";

export interface UserWithMemberships extends User {
  organization_members?: OrganizationMember[];
  workspace_members?: WorkspaceMember[];
}

export interface WorkspaceWithMembers extends Workspace {
  workspace_members?: (WorkspaceMember & { users?: User })[];
}

export interface DepartmentWithMembers extends Department {
  department_members?: (DepartmentMember & { users?: User })[];
}

export interface OrganizationWithDetails extends Organization {
  organization_members?: (OrganizationMember & { users?: User })[];
  workspaces?: Workspace[];
  organization_subscriptions?: (OrganizationSubscription & { plans?: Plan })[];
  credit_wallets?: CreditWallet[];
}
