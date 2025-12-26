export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          nome: string;
          email: string;
          telefone: string | null;
          segmento: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          nome: string;
          email: string;
          telefone?: string | null;
          segmento?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          telefone?: string | null;
          segmento?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          deleted_at?: string | null;
        };
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Tipos mockados para as demais entidades (serão criadas conforme necessário)
export type Organization = {
  id: string;
  name: string;
  legal_name: string | null;
  document: string | null;
  timezone: string;
  currency: string;
  created_at: string;
};

export type OrganizationMember = {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "admin";
  created_at: string;
};

export type Workspace = {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type WorkspaceMember = {
  id: string;
  workspace_id: string;
  user_id: string;
  role: "admin" | "manager" | "agent" | "viewer";
  created_at: string;
};

export type Department = {
  id: string;
  workspace_id: string;
  name: string;
  created_at: string;
};

export type DepartmentMember = {
  id: string;
  department_id: string;
  user_id: string;
  role: "manager" | "agent";
  created_at: string;
};

export type Invite = {
  id: string;
  organization_id: string;
  email: string;
  invited_by: string;
  role: string;
  workspace_id: string | null;
  expires_at: string;
  status: string;
  created_at: string;
};

export type Plan = {
  id: string;
  name: string;
  price_cents: number;
  included_credits: number;
  max_numbers: number | null;
  max_users: number | null;
  created_at: string;
};

export type OrganizationSubscription = {
  id: string;
  organization_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  current_period_end: string;
  created_at: string;
};

export type CreditWallet = {
  id: string;
  organization_id: string;
  balance: number;
  created_at: string;
};

export type CreditLedger = {
  id: string;
  organization_id: string;
  type: "plan" | "purchase" | "usage" | "adjustment";
  amount: number;
  reference_type: string | null;
  reference_id: string | null;
  expires_at: string | null;
  created_at: string;
};

export type WhatsAppAccount = {
  id: string;
  organization_id: string;
  provider: string;
  waba_id: string | null;
  status: string;
  created_at: string;
};

export type WhatsAppNumber = {
  id: string;
  whatsapp_account_id: string;
  workspace_id: string;
  phone_number: string;
  display_name: string | null;
  quality_rating: string | null;
  status: string;
  created_at: string;
};

export type WhatsAppTemplate = {
  id: string;
  whatsapp_account_id: string;
  workspace_id: string;
  name: string;
  category: string;
  status: string;
  language: string;
  created_at: string;
};

export type Contact = {
  id: string;
  organization_id: string;
  workspace_id: string;
  phone: string;
  name: string | null;
  opt_in: boolean;
  opt_in_at: string | null;
  created_at: string;
};

export type Campaign = {
  id: string;
  organization_id: string;
  workspace_id: string;
  template_id: string;
  status: string;
  scheduled_at: string | null;
  created_at: string;
};

export type CampaignMessage = {
  id: string;
  campaign_id: string;
  contact_id: string;
  department_id: string | null;
  status: string;
  credits_used: number;
  provider_message_id: string | null;
  created_at: string;
};

export type StripeCustomer = {
  id: string;
  organization_id: string;
  stripe_customer_id: string;
  email: string;
  created_at: string;
};

export type StripeSubscription = {
  id: string;
  organization_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
};

export type StripeInvoice = {
  id: string;
  organization_id: string;
  stripe_invoice_id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string;
  paid: boolean;
  hosted_invoice_url: string | null;
  created_at: string;
};

export type StripeEvent = {
  id: string;
  stripe_event_id: string;
  type: string;
  payload: Json;
  processed: boolean;
  created_at: string;
};
