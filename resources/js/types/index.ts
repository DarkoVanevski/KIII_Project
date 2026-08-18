import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    flash: { success?: string | null; error?: string | null };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Client {
    id: number;
    user_id: number;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    notes: string | null;
    invoices_count?: number;
    created_at: string;
    updated_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface InvoiceItem {
    id: number;
    invoice_id: number;
    description: string;
    quantity: string;
    unit_price: string;
    amount: string;
    position: number;
}

export interface Invoice {
    id: number;
    user_id: number;
    client_id: number;
    invoice_number: string;
    status: InvoiceStatus;
    issue_date: string;
    due_date: string;
    notes: string | null;
    subtotal: string;
    tax_rate: string;
    tax_amount: string;
    total: string;
    sent_at: string | null;
    paid_at: string | null;
    client?: Client;
    items?: InvoiceItem[];
}
