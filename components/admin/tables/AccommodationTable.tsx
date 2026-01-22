"use client";

import Link from "next/link";

interface Accommodation {
  id: number;
  type: string;
  price: number;
  startDate: string;
  endDate: string;
  available: boolean;
  description: string;
}

interface AccommodationTableProps {
  accommodations: Accommodation[];
  onToggleAvailability: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export default function AccommodationTable({
  accommodations,
  onToggleAvailability,
  onDelete,
  isLoading = false,
}: AccommodationTableProps) {
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this accommodation?")) {
      onDelete(id);
    }
  };

  if (accommodations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No accommodation packages found</p>
        <Link
          href="/admin/accommodation/new"
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Create First Package
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {accommodations.map((acc) => (
        <div
          key={acc.id}
          className="border rounded-lg p-4 hover:shadow-lg transition bg-white"
        >
          {/* Availability Toggle */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-800">{acc.type}</h3>
            <button
              onClick={() => onToggleAvailability(acc.id)}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                acc.available ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  acc.available ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${
              acc.available
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {acc.available ? "✓ Available" : "✗ Full"}
          </span>

          <div className="space-y-2 mb-4">
            <p className="text-2xl font-bold text-indigo-600">₹{acc.price}</p>
            <div className="text-sm text-gray-600">
              <p>
                📅 {acc.startDate} to {acc.endDate}
              </p>
              <p className="text-indigo-600 font-medium">
                Duration: {calculateDuration(acc.startDate, acc.endDate)} days
              </p>
            </div>
            {acc.description && (
              <p className="text-sm text-gray-600 mt-2">📝 {acc.description}</p>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Link
              href={`/admin/accommodation/${acc.id}`}
              className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 text-center"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(acc.id)}
              disabled={isLoading}
              className="flex-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
