// Custom hooks for fetching events data from the API
// Uses types derived from supabase.ts

import { useState, useEffect } from 'react';
import { Database } from '@/types/supabase';
import {
    EventWithRelations,
    EventsApiResponse,
    CategoriesApiResponse,
    generateSlug,
    FormattedFee,
    extractFees,
} from '@/types/events';

// Base category type from Supabase
type EventCategoryRow = Database['public']['Tables']['event_category']['Row'];

// Hook for fetching all event categories
export function useEventCategories() {
    const [categories, setCategories] = useState<EventCategoryRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCategories() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/api/events/categories');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: CategoriesApiResponse = await response.json();

                if (data.error) {
                    setError(data.error);
                    return;
                }

                setCategories(data.categories || []);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch categories');
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, []);

    return { categories, loading, error };
}

// Hook for fetching all events
export function useEvents() {
    const [events, setEvents] = useState<EventWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchEvents() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/api/events');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: EventsApiResponse = await response.json();

                if (data.error) {
                    setError(data.error);
                    return;
                }

                setEvents(data.events || []);
            } catch (err) {
                console.error('Failed to fetch events:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch events');
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
    }, []);

    return { events, loading, error };
}

// Hook for fetching events by category slug (category_name converted to slug)
export function useEventsByCategorySlug(categorySlug: string | null) {
    const [events, setEvents] = useState<EventWithRelations[]>([]);
    const [category, setCategory] = useState<EventCategoryRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!categorySlug) {
            setEvents([]);
            setCategory(null);
            setLoading(false);
            return;
        }

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                // Step 1: Fetch all categories to find the matching one by slug
                const catResponse = await fetch('/api/events/categories');

                if (!catResponse.ok) {
                    throw new Error(`Failed to fetch categories: ${catResponse.status}`);
                }

                const catData: CategoriesApiResponse = await catResponse.json();

                if (catData.error) {
                    setError(catData.error);
                    setLoading(false);
                    return;
                }

                // Find category that matches the slug
                const matchedCategory = catData.categories?.find(
                    (cat) => generateSlug(cat.category_name) === categorySlug
                );

                if (!matchedCategory) {
                    setError('Category not found');
                    setLoading(false);
                    return;
                }

                setCategory(matchedCategory);

                // Step 2: Fetch events for this category using category_id
                const eventsResponse = await fetch(`/api/events?category_id=${matchedCategory.category_id}`);

                if (!eventsResponse.ok) {
                    throw new Error(`Failed to fetch events: ${eventsResponse.status}`);
                }

                const eventsData: EventsApiResponse = await eventsResponse.json();

                if (eventsData.error) {
                    setError(eventsData.error);
                    return;
                }

                setEvents(eventsData.events || []);
            } catch (err) {
                console.error('Failed to fetch events by category:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch events');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [categorySlug]);

    return { events, category, loading, error };
}

// Hook for fetching a single event by category slug and event name slug
export function useEventBySlug(categorySlug: string | null, eventSlug: string | null) {
    const [event, setEvent] = useState<EventWithRelations | null>(null);
    const [fees, setFees] = useState<FormattedFee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!categorySlug || !eventSlug) {
            setEvent(null);
            setFees([]);
            setLoading(false);
            return;
        }

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                // Step 1: Fetch all categories to find matching category
                const catResponse = await fetch('/api/events/categories');

                if (!catResponse.ok) {
                    throw new Error(`Failed to fetch categories: ${catResponse.status}`);
                }

                const catData: CategoriesApiResponse = await catResponse.json();

                if (catData.error) {
                    setError(catData.error);
                    setLoading(false);
                    return;
                }

                const matchedCategory = catData.categories?.find(
                    (cat) => generateSlug(cat.category_name) === categorySlug
                );

                if (!matchedCategory) {
                    setError('Category not found');
                    setLoading(false);
                    return;
                }

                // Step 2: Fetch events for this category
                const eventsResponse = await fetch(`/api/events?category_id=${matchedCategory.category_id}`);

                if (!eventsResponse.ok) {
                    throw new Error(`Failed to fetch events: ${eventsResponse.status}`);
                }

                const eventsData: EventsApiResponse = await eventsResponse.json();

                if (eventsData.error) {
                    setError(eventsData.error);
                    setLoading(false);
                    return;
                }

                // Step 3: Find event that matches the event slug
                const matchedEvent = eventsData.events?.find(
                    (evt) => generateSlug(evt.event_name) === eventSlug
                );

                if (!matchedEvent) {
                    setError('Event not found');
                    setLoading(false);
                    return;
                }

                setEvent(matchedEvent);
                setFees(extractFees(matchedEvent));
            } catch (err) {
                console.error('Failed to fetch event:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch event');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [categorySlug, eventSlug]);

    return { event, fees, loading, error };
}

// Hook for fetching event by direct event ID
export function useEventById(eventId: number | null) {
    const [event, setEvent] = useState<EventWithRelations | null>(null);
    const [fees, setFees] = useState<FormattedFee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (eventId === null) {
            setEvent(null);
            setFees([]);
            setLoading(false);
            return;
        }

        async function fetchEvent() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/events?event_id=${eventId}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch event: ${response.status}`);
                }

                const data: EventsApiResponse = await response.json();

                if (data.error) {
                    setError(data.error);
                    return;
                }

                if (data.event) {
                    setEvent(data.event);
                    setFees(extractFees(data.event));
                } else {
                    setError('Event not found');
                }
            } catch (err) {
                console.error('Failed to fetch event:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch event');
            } finally {
                setLoading(false);
            }
        }

        fetchEvent();
    }, [eventId]);

    return { event, fees, loading, error };
}
