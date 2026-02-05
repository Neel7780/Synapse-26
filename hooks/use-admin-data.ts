/**
 * Custom React Hooks for Admin Data Fetching
 * Provides hooks with loading states, error handling, and refetching
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import * as adminApi from "@/lib/admin-api";

type UseDataResult<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
};

/**
 * Generic hook for fetching data with a stable key for refetching
 * @param fetchFn - Function that returns a promise of the API response
 * @param key - Stable key to trigger refetch when changed (use JSON.stringify for objects)
 */
function useAdminData<T>(
    fetchFn: () => Promise<adminApi.ApiResponse<T>>,
    key: string = ""
): UseDataResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchFn();
            if (response.error) {
                setError(response.error);
                setData(null);
            } else {
                setData(response.data || null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            setData(null);
        }
        setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, refetchTrigger]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = useCallback(async () => {
        setRefetchTrigger(prev => prev + 1);
    }, []);

    return { data, loading, error, refetch };
}

// ============================================================================
// Dashboard Stats Hook
// ============================================================================

export function useDashboardStats() {
  const fetchFn = useCallback(() => adminApi.dashboardApi.getStats(), []);
  return useAdminData(fetchFn, "dashboard-stats");
}

// ============================================================================
// Events Hooks
// ============================================================================

export function useEvents() {
    const fetchFn = useCallback(() => adminApi.eventsApi.getAll(), []);
    return useAdminData(fetchFn, "events");
}

export function useCreateEvent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createEvent = async (payload: adminApi.CreateEventPayload) => {
        setLoading(true);
        setError(null);
        const response = await adminApi.eventsApi.create(payload);
        setLoading(false);
        if (response.error) {
            setError(response.error);
            return null;
        }
        return response.data;
    };

    return { createEvent, loading, error };
}

export function useUpdateEvent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateEvent = async (
        eventId: number,
        payload: Partial<adminApi.CreateEventPayload> & { event_id: number }
    ) => {
        setLoading(true);
        setError(null);
        const response = await adminApi.eventsApi.update(eventId, payload);
        setLoading(false);
        if (response.error) {
            setError(response.error);
            return null;
        }
        return response.data;
    };

    return { updateEvent, loading, error };
}

export function useDeleteEvent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteEvent = async (eventId: number) => {
        setLoading(true);
        setError(null);
        const response = await adminApi.eventsApi.delete(eventId);
        setLoading(false);
        if (response.error) {
            setError(response.error);
            return false;
        }
        return true;
    };

    return { deleteEvent, loading, error };
}

// ============================================================================
// Categories Hooks
// ============================================================================

export function useCategories() {
    const fetchFn = useCallback(() => adminApi.categoriesApi.getAll(), []);
    return useAdminData(fetchFn, "categories");
}

// ============================================================================
// Registrations Hooks
// ============================================================================

export function useRegistrations(filters: adminApi.RegistrationFilters = {}) {
    const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
    const fetchFn = useCallback(
        () => adminApi.registrationsApi.getAll(filters),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filtersKey]
    );
    return useAdminData(fetchFn, `registrations-${filtersKey}`);
}

export function useRegistrationEventList() {
    const fetchFn = useCallback(() => adminApi.registrationsApi.getEventList(), []);
    return useAdminData(fetchFn, "registration-events");
}

// ============================================================================
// Accommodation Hooks
// ============================================================================

export function useAccommodationOrders(filters: { page?: number; limit?: number; status?: string } = {}) {
    const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
    const fetchFn = useCallback(
        () => adminApi.accommodationApi.getAll(filters),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filtersKey]
    );
    return useAdminData(fetchFn, `accommodation-orders-${filtersKey}`);
}

// ============================================================================
// Users Hooks
// ============================================================================

export function useUsers(filters: adminApi.UserFilters = {}) {
    const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
    const fetchFn = useCallback(
        () => adminApi.usersApi.getAll(filters),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filtersKey]
    );
    return useAdminData(fetchFn, `users-${filtersKey}`);
}

export function useUserEventList() {
    const fetchFn = useCallback(() => adminApi.usersApi.getEventList(), []);
    return useAdminData(fetchFn, "user-events");
}

// ============================================================================
// Sponsors Hooks
// ============================================================================

export function useSponsors() {
    const fetchFn = useCallback(() => adminApi.sponsorsApi.getAll(), []);
    return useAdminData(fetchFn, "sponsors");
}

export function useSponsorById(id: number) {
    const fetchFn = useCallback(
        () => adminApi.sponsorsApi.getById(id),
        [id]
    );
    return useAdminData(fetchFn, `sponsor-${id}`);
}

export function useCreateSponsor() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createSponsor = async (payload: Omit<adminApi.Sponsor, "sponsor_id">) => {
        setLoading(true);
        setError(null);
        const response = await adminApi.sponsorsApi.create(payload);
        setLoading(false);
        if (response.error) {
            setError(response.error);
            return null;
        }
        return response.data;
    };

    return { createSponsor, loading, error };
}

export function useUpdateSponsor() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateSponsor = async (id: number, payload: Partial<adminApi.Sponsor>) => {
        setLoading(true);
        setError(null);
        const response = await adminApi.sponsorsApi.update(id, payload);
        setLoading(false);
        if (response.error) {
            setError(response.error);
            return null;
        }
        return response.data;
    };

    return { updateSponsor, loading, error };
}

export function useDeleteSponsor() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteSponsor = async (id: number) => {
        setLoading(true);
        setError(null);
        const response = await adminApi.sponsorsApi.delete(id);
        setLoading(false);
        if (response.error) {
            setError(response.error);
            return false;
        }
        return true;
    };

    return { deleteSponsor, loading, error };
}

// ============================================================================
// Artists Hooks
// ============================================================================

export function useArtists() {
    const fetchFn = useCallback(() => adminApi.artistsApi.getAll(), []);
    return useAdminData(fetchFn, "artists");
}

export function useCreateArtist() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createArtist = async (payload: Omit<adminApi.Artist, "id" | "concert">) => {
        setLoading(true);
        setError(null);
        const response = await adminApi.artistsApi.create(payload);
        setLoading(false);
        if (response.error) {
            setError(response.error);
            return null;
        }
        return response.data;
    };

    return { createArtist, loading, error };
}

export function useDeleteArtist() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteArtist = async (id: number) => {
        setLoading(true);
        setError(null);
        const response = await adminApi.artistsApi.delete(id);
        setLoading(false);
        if (response.error) {
            setError(response.error);
            return false;
        }
        return true;
    };

    return { deleteArtist, loading, error };
}

// ============================================================================
// Merchandise Hooks
// ============================================================================

export function useMerchandiseProducts() {
    const fetchFn = useCallback(() => adminApi.merchandiseApi.products.getAll(), []);
    return useAdminData(fetchFn, "merchandise-products");
}

export function useMerchandiseOrders() {
    const fetchFn = useCallback(() => adminApi.merchandiseApi.orders.getAll(), []);
    return useAdminData(fetchFn, "merchandise-orders");
}
