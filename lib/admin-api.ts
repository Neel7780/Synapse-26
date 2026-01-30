/**
 * Admin API Client
 * Central utility for making authenticated API calls to admin endpoints
 */

export type ApiResponse<T> = {
    data?: T;
    error?: string;
    message?: string;
};

/**
 * Base fetch wrapper with authentication
 */
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                error: data.error || `HTTP ${response.status}: ${response.statusText}`,
            };
        }

        return { data };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Network error occurred",
        };
    }
}

// ============================================================================
// Events API
// ============================================================================

export type EventFee = {
    type: string;
    price: number;
    min?: number;
    max?: number;
};

export type Event = {
    event_id: number;
    event_name: string;
    category_id: number;
    event_date: string;
    event_picture?: string;
    rulebook?: string;
    description?: string;
    coordinator_email?: string;
    venue?: string;
    is_registration_open: boolean;
    is_dau_free: boolean;
    event_category?: { category_name: string };
    event_fee?: Array<{
        fee: {
            fee_id: number;
            participation_type: string;
            price: number;
            min_members: number;
            max_members: number;
            qr_code?: string;
        };
    }>;
};

export type CreateEventPayload = {
    event_name: string;
    category_id?: number;
    category_name?: string;
    event_date: string;
    event_time?: string;
    event_picture?: string;
    rulebook?: string;
    description?: string;
    is_registration_open?: boolean;
    is_dau_free?: boolean;
    coordinator_email?: string;
    venue?: string;
    image?: File;
    qr_code_solo?: File;
    qr_code_duet?: File;
    qr_code_group?: File;
    qr_code_custom?: File;
    fees?: EventFee[];
};

/**
 * Helper function to build FormData for event requests
 */
function buildEventFormData(payload: Partial<CreateEventPayload> & { event_id?: number }): FormData {
    const formData = new FormData();

    // Add all fields to FormData
    if (payload.event_id !== undefined) formData.append('event_id', payload.event_id.toString());
    if (payload.event_name) formData.append('event_name', payload.event_name);
    if (payload.category_id) formData.append('category_id', payload.category_id.toString());
    if (payload.category_name) formData.append('category_name', payload.category_name);
    if (payload.event_date) formData.append('event_date', payload.event_date);
    if (payload.event_time) formData.append('event_time', payload.event_time);
    if (payload.event_picture) formData.append('event_picture', payload.event_picture);
    if (payload.rulebook) formData.append('rulebook', payload.rulebook);
    if (payload.description) formData.append('description', payload.description);
    if (payload.coordinator_email) formData.append('coordinator_email', payload.coordinator_email);
    if (payload.venue) formData.append('venue', payload.venue);
    // Boolean fields
    if (payload.is_registration_open !== undefined) {
        formData.append('is_registration_open', payload.is_registration_open ? 'true' : 'false');
    }
    if (payload.is_dau_free !== undefined) {
        formData.append('is_dau_free', payload.is_dau_free ? 'true' : 'false');
    }

    // Handle image file
    if (payload.image) {
        formData.append('image', payload.image);
    }

    // Handle QR code files
    if (payload.qr_code_solo) {
        formData.append('qr_code_solo', payload.qr_code_solo);
    }
    if (payload.qr_code_duet) {
        formData.append('qr_code_duet', payload.qr_code_duet);
    }
    if (payload.qr_code_group) {
        formData.append('qr_code_group', payload.qr_code_group);
    }
    if (payload.qr_code_custom) {
        formData.append('qr_code_custom', payload.qr_code_custom);
    }

    // Handle fees array - convert to JSON string
    if (payload.fees && payload.fees.length > 0) {
        formData.append('fees', JSON.stringify(payload.fees));
    }

    return formData;
}

/**
 * Fetch wrapper for FormData requests (no Content-Type header)
 */
async function apiFormDataFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(endpoint, {
            ...options,
            // Don't set Content-Type for FormData - browser sets it with boundary
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                error: data.error || `HTTP ${response.status}: ${response.statusText}`,
            };
        }

        return { data };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Network error occurred",
        };
    }
}

export const eventsApi = {
    getAll: () => apiFetch<{ events: Event[] }>("/api/admin/events"),

    create: (payload: CreateEventPayload) => {
        const formData = buildEventFormData(payload);
        return apiFormDataFetch<{ event: Event }>("/api/admin/events", {
            method: "POST",
            body: formData,
        });
    },

    update: (eventId: number, payload: Partial<CreateEventPayload> & { event_id: number }) => {
        const formData = buildEventFormData({ ...payload, event_id: eventId });
        return apiFormDataFetch<{ event: Event }>("/api/admin/events", {
            method: "PUT",
            body: formData,
        });
    },

    delete: (eventId: number) =>
        apiFetch<{ success: boolean }>(`/api/admin/events?id=${eventId}`, {
            method: "DELETE",
        }),
};

// ============================================================================
// Categories API
// ============================================================================

export type Category = {
    category_id: number;
    category_name: string;
    category_description?: string;
    category_image?: string;
};

export const categoriesApi = {
    getAll: () => apiFetch<{ categories: Category[] }>("/api/admin/categories"),

    create: (payload: Omit<Category, "category_id">) =>
        apiFetch<Category>("/api/admin/categories", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    update: (categoryId: number, payload: Partial<Category>) =>
        apiFetch<Category>("/api/admin/categories", {
            method: "PUT",
            body: JSON.stringify({ ...payload, category_id: categoryId }),
        }),

    delete: (categoryId: number) =>
        apiFetch<{ success: boolean }>(`/api/admin/categories?id=${categoryId}`, {
            method: "DELETE",
        }),
};

// ============================================================================
// Registrations API
// ============================================================================

export type Registration = {
    registration_id: string;
    transaction_id: string;
    user_name: string;
    college: string;
    event_name: string;
    category: string;
    participation_type: string;
    payment_method: string;
    group_size: number;
    payment_status: string;
    gross_amount: number;
    gateway_charge: number;
    net_amount: number;
    coordinator_status?: string | null;
};

export type RegistrationsResponse = {
    page: number;
    limit: number;
    total: number;
    summary: {
        total_registrations: number;
        paid: number;
        gross_revenue: number;
        gateway_charges: number;
        net_revenue: number;
    };
    data: Registration[];
};

export type RegistrationFilters = {
    page?: number;
    limit?: number;
    searchParams?: string;
    filter?: string;
    paymentMethod?: string;
    paymentStatus?: string;
};

export const registrationsApi = {
    getAll: (filters: RegistrationFilters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
                params.append(key, value.toString());
            }
        });
        return apiFetch<RegistrationsResponse>(
            `/api/admin/registrations?${params.toString()}`
        );
    },

    getById: (id: string) =>
        apiFetch<Registration>(`/api/admin/registrations/${id}`),

    getEventList: () =>
        apiFetch<{ events: string[] }>("/api/admin/registrations/eventlist"),

    exportData: (filters: RegistrationFilters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
                params.append(key, value.toString());
            }
        });
        // This is a direct download link, usually handled by window.open or anchor tag
        return `/api/admin/registrations/export?${params.toString()}`;
    },
};

// ============================================================================
// Accommodation API
// ============================================================================

export type AccommodationOrder = {
    order_id: number;
    booking_id: number;
    user_id: string;
    user_name: string | null;
    user_email: string | null;
    check_in: string | null;
    check_out: string | null;
    nights: number;
    amount: number;
    verification_status: string;
    payment_screenshot_url: string | null;
    transaction_reference: string | null;
    created_at: string;
};

export type AccommodationResponse = {
    orders: AccommodationOrder[];
    count: number;
    summary: {
        total_orders: number;
        pending_verification: number;
        verified: number;
        rejected: number;
        total_revenue: number;
    };
    page: number;
    limit: number;
    total_pages: number;
};

export const accommodationApi = {
    getAll: (filters: { page?: number; limit?: number; status?: string } = {}) => {
        const params = new URLSearchParams();
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.status) params.append("status", filters.status);

        return apiFetch<AccommodationResponse>(
            `/api/admin/accommodation/orders?${params.toString()}`
        );
    },
};


// ============================================================================
// Users API
// ============================================================================

export type User = {
    user_id: string;
    user_name: string;
    email: string;
    phone: string;
    college: string;
    registration_date: string;
    event_count: number;
};

export type UsersResponse = {
    total: number;
    page: number;
    limit: number;
    users: User[];
};

export type UserFilters = {
    page?: number;
    limit?: number;
    searchParams?: string;
    filter?: string;
};

export const usersApi = {
    getAll: (filters: UserFilters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
                params.append(key, value.toString());
            }
        });
        return apiFetch<UsersResponse>(`/api/admin/users?${params.toString()}`);
    },

    getById: (id: string) => apiFetch<User>(`/api/admin/users/${id}`),

    getEventList: () => apiFetch<{ events: string[] }>("/api/admin/users/eventlist"),

    exportData: (filters: UserFilters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
                params.append(key, value.toString());
            }
        });
        return apiFetch<{ csv: string }>(`/api/admin/users/export?${params.toString()}`);
    },
};

// ============================================================================
// Sponsors API
// ============================================================================

export type Sponsor = {
    sponsor_id: number;
    name: string;
    tier: string;
    website_url?: string;
    logo_url?: string;
    description?: string;
};

export const sponsorsApi = {
    getAll: () => apiFetch<{ sponsors: Sponsor[]; count: number }>("/api/admin/sponsors"),

    getById: (id: number) => apiFetch<Sponsor>(`/api/admin/sponsors/${id}`),

    create: (payload: Omit<Sponsor, "sponsor_id">) =>
        apiFetch<{ sponsor: Sponsor }>("/api/admin/sponsors", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    update: (id: number, payload: Partial<Sponsor>) =>
        apiFetch<{ sponsor: Sponsor }>(`/api/admin/sponsors/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        }),

    delete: (id: number) =>
        apiFetch<{ success: boolean }>(`/api/admin/sponsors/${id}`, {
            method: "DELETE",
        }),
};

// ============================================================================
// Artists API
// ============================================================================

export type Artist = {
    id: number;
    name: string;
    concert_id: number;
    genre?: string;
    reveal_date: string;
    bio?: string;
    artist_image_url?: string;
    concert?: {
        concert_name: string;
    };
};

export const artistsApi = {
    getAll: () => apiFetch<Artist[]>("/api/admin/artists"),

    create: (payload: Omit<Artist, "id" | "concert">) =>
        apiFetch<{ data: Artist }>("/api/admin/artists", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    delete: (id: number) =>
        apiFetch<{ success: boolean }>("/api/admin/artists", {
            method: "DELETE",
            body: JSON.stringify({ id }),
        }),
};

// ============================================================================
// Concerts API
// ============================================================================

export type Concert = {
    concert_id: number;
    concert_name: string;
    concert_date: string;
    venue?: string;
    description?: string;
    ticket_price?: number;
};

export const concertsApi = {
    getAll: () => apiFetch<Concert[]>("/api/admin/concerts"),

    create: (payload: Omit<Concert, "concert_id">) =>
        apiFetch<Concert>("/api/admin/concerts", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    update: (id: number, payload: Partial<Concert>) =>
        apiFetch<Concert>("/api/admin/concerts", {
            method: "PUT",
            body: JSON.stringify({ ...payload, concert_id: id }),
        }),

    delete: (id: number) =>
        apiFetch<{ success: boolean }>(`/api/admin/concerts?id=${id}`, {
            method: "DELETE",
        }),
};

// ============================================================================
// Merchandise API
// ============================================================================

export type MerchandiseProduct = {
    product_id: number;
    product_name: string;
    price: number;
    available_sizes?: string[];
    product_image?: string;
    description?: string;
    is_available: boolean;
};

export type MerchandiseOrder = {
    order_id: number;
    customer_id: string;
    items: unknown;
    amount: number;
    order_date: string;
    payment_status: string;
    payment_method: string;
};

export const merchandiseApi = {
    products: {
        getAll: () =>
            apiFetch<{ products: MerchandiseProduct[]; count: number }>(
                "/api/admin/merchandise/management"
            ),

        getById: (id: number) =>
            apiFetch<MerchandiseProduct>(`/api/admin/merchandise/management/${id}`),

        create: (payload: Omit<MerchandiseProduct, "product_id">) =>
            apiFetch<{ product: MerchandiseProduct }>("/api/admin/merchandise/management", {
                method: "POST",
                body: JSON.stringify(payload),
            }),

        update: (id: number, payload: Partial<MerchandiseProduct>) =>
            apiFetch<{ product: MerchandiseProduct }>(
                `/api/admin/merchandise/management/${id}`,
                {
                    method: "PUT",
                    body: JSON.stringify(payload),
                }
            ),

        delete: (id: number) =>
            apiFetch<{ success: boolean }>(`/api/admin/merchandise/management/${id}`, {
                method: "DELETE",
            }),
    },

    orders: {
        getAll: () =>
            apiFetch<{ orders: MerchandiseOrder[]; count: number }>(
                "/api/admin/merchandise/orders"
            ),

        getById: (id: number) =>
            apiFetch<MerchandiseOrder>(`/api/admin/merchandise/orders/${id}`),

        create: (payload: Omit<MerchandiseOrder, "order_id">) =>
            apiFetch<{ order: MerchandiseOrder }>("/api/admin/merchandise/orders", {
                method: "POST",
                body: JSON.stringify(payload),
            }),

        update: (id: number, payload: Partial<MerchandiseOrder>) =>
            apiFetch<{ order: MerchandiseOrder }>(`/api/admin/merchandise/orders/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            }),
    },
};


