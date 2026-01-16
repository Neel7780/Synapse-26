'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AccommodationForm from '@/components/admin/forms/AccommodationForm';

interface AccommodationData {
  type: string;
  price: string | number;
  startDate: string;
  endDate: string;
  description: string;
  available?: boolean;
}

interface Accommodation {
  id: number;
  type: string;
  price: number;
  startDate: string;
  endDate: string;
  description: string;
  available: boolean;
}

export default function EditAccommodationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    // Fetch accommodation data
    // const fetchAccommodation = async () => {
    //   try {
    //     const response = await fetch(`/api/admin/accommodation/${id}`);
    //     const data = await response.json();
    //     setAccommodation(data);
    //   } catch (error) {
    //     console.error('Error fetching accommodation:', error);
    //   } finally {
    //     setIsLoadingData(false);
    //   }
    // };

    // Mock data for demonstration
    setTimeout(() => {
      setAccommodation({
        id: parseInt(id),
        type: 'Deluxe Package',
        price: 5000,
        startDate: '2025-12-20',
        endDate: '2025-12-24',
        available: true,
        description: '4 days accommodation with meals',
      });
      setIsLoadingData(false);
    }, 500);
  }, [id]);

  const handleSubmit = async (data: AccommodationData) => {
    setIsLoading(true);
    try {
      // Call your API endpoint here
      // const response = await fetch(`/api/admin/accommodation/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // On success, redirect to list
      router.push('/admin/accommodation');
    } catch (error) {
      console.error('Error updating accommodation:', error);
      alert('Failed to update accommodation');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!accommodation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Accommodation not found</p>
        <Link href="/admin/accommodation" className="text-indigo-600 hover:text-indigo-700">
          Back to Accommodations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/accommodation" className="text-indigo-600 hover:text-indigo-700">
          ← Back to Accommodations
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Edit Accommodation Package</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <AccommodationForm
          initialData={accommodation}
          onSubmit={handleSubmit}
          submitButtonText="Update Package"
          isLoading={isLoading}
        />

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Availability Status</span>
            <button
              onClick={() =>
                setAccommodation({
                  ...accommodation,
                  available: !accommodation.available,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                accommodation.available ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  accommodation.available ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-xs ${
                accommodation.available ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {accommodation.available ? 'Available' : 'Full'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
