// Event-related TypeScript types derived directly from Supabase schema
// Uses the Database types from supabase.ts

import { Database } from './supabase';

// Base row types from Supabase tables
export type EventRow = Database['public']['Tables']['event']['Row'];
export type EventCategoryRow = Database['public']['Tables']['event_category']['Row'];
export type FeeRow = Database['public']['Tables']['fee']['Row'];
export type EventFeeRow = Database['public']['Tables']['event_fee']['Row'];

// Participation type enum from Supabase
export type ParticipationType = Database['public']['Enums']['participation_type_enum'];

// Fee details from the fee table
export interface FeeDetails {
    fee_id: number;
    participation_type: ParticipationType;
    price: number;
    min_members: number;
    max_members: number;
    qr_code: string | null;
}

// Event fee relation with nested fee details (matches Supabase join response)
// Note: event_fee table only has event_id and fee_id in the actual database
export interface EventFeeWithDetails {
    event_id: number;
    fee_id: number;
    fee: FeeDetails;
}

// Event category info
export interface EventCategoryInfo {
    category_id: number;
    category_name: string;
    category_image: string | null;
    description: string | null;
}

// Event with all nested relations (matches API response structure)
export interface EventWithRelations {
    event_id: number;
    event_name: string;
    description: string | null;
    event_date: string;
    event_picture: string | null;
    rulebook: string | null;
    is_dau_free: boolean | null;
    is_registration_open: boolean | null;
    venue?: string | null;
    category_id: number | null;
    coordinator_email: string | null;
    event_category: EventCategoryInfo | null;
    event_fee: EventFeeWithDetails[];
}

// API Response types
export interface EventsApiResponse {
    events?: EventWithRelations[];
    event?: EventWithRelations;
    error?: string;
}

export interface CategoriesApiResponse {
    categories?: EventCategoryRow[];
    error?: string;
}

// Utility to generate URL slug from name
export function generateSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Formatted fee for display in UI (flattened structure)
export interface FormattedFee {
    fee_id: number;
    type: ParticipationType;
    price: number;
    min_members: number;
    max_members: number;
    qr_code: string | null; // From fee table
    event_id: number;
}

// Extract and format fees from event
export function extractFees(event: EventWithRelations): FormattedFee[] {
    if (!event.event_fee || !Array.isArray(event.event_fee)) {
        return [];
    }

    return event.event_fee
        .filter(ef => ef.fee) // Ensure fee exists
        .map((ef) => ({
            fee_id: ef.fee.fee_id,
            type: ef.fee.participation_type,
            price: ef.fee.price,
            min_members: ef.fee.min_members,
            max_members: ef.fee.max_members,
            qr_code: ef.fee.qr_code,
            event_id: event.event_id,
        }));
}
