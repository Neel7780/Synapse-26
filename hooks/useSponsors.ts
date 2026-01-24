import { useState, useEffect } from 'react';

export interface Sponsor {
    sponsor_id: number;
    name: string;
    logo_url: string | null;
    website_url: string | null;
    category_id: number | null;
}

export interface SponsorCategory {
    sponsor_category_id: number;
    tier: string;
    rank: number | null;
    sponsors: Sponsor[];
}

export function useSponsors() {
    const [categories, setCategories] = useState<SponsorCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSponsors() {
            try {
                const response = await fetch('/api/sponsors');
                if (!response.ok) {
                    throw new Error('Failed to fetch sponsors');
                }
                const data = await response.json();
                setCategories(data.categories);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchSponsors();
    }, []);

    return { categories, loading, error };
}
