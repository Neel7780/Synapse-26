"use client";

import { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";

type Fee = {
  fee_id: number;
  participation_type: string;
  min_members: number;
  max_members: number;
  price: number;
};

type EventFee = {
  fee: Fee;
};

type Event = {
  event_fee?: EventFee[];
  is_dau_free?: boolean;
};

type User = {
  id: string;
  email?: string;
} | null;

interface EventRegistrationProps {
  event: Event;
  user: User;
}

const FeeOption = memo(function FeeOption({
  fee,
  isSelected,
  onSelect,
}: {
  fee: Fee;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const typeLabel =
    fee.participation_type.charAt(0).toUpperCase() +
    fee.participation_type.slice(1);

  return (
    <label
      className={`flex items-center justify-between p-4 border rounded cursor-pointer transition-all ${isSelected
          ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
          : "border-gray-200 hover:border-gray-300"
        }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="radio"
          name="fee_selection"
          value={fee.fee_id}
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 text-blue-600"
        />
        <span className="font-medium text-gray-900">
          {typeLabel}{" "}
          <span className="text-gray-500 text-sm">
            ({fee.min_members} - {fee.max_members} members)
          </span>
        </span>
      </div>
      <span className="font-bold text-gray-900">₹{fee.price}</span>
    </label>
  );
});

export default function EventRegistration({ event, user }: EventRegistrationProps) {
  const router = useRouter();
  const [selectedFeeId, setSelectedFeeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = useCallback(async () => {
    if (!selectedFeeId) {
      alert("Please select a participation type first.");
      return;
    }

    if (!user) {
      router.push("/auth");
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement registration without payment gateway
      alert("Online registration is currently not available. Please contact the organizers.");
    } catch (error) {
      console.error("Registration Error:", error);
      alert(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }, [selectedFeeId, user, router]);

  const handleFeeSelect = useCallback((feeId: number) => {
    setSelectedFeeId(feeId);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Select Participation Type
      </h3>

      {/* Fee Selection List */}
      <div className="space-y-3 mb-6">
        {event.event_fee?.map((item) => {
          const fee = item.fee;
          return (
            <FeeOption
              key={fee.fee_id}
              fee={fee}
              isSelected={selectedFeeId === fee.fee_id}
              onSelect={() => handleFeeSelect(fee.fee_id)}
            />
          );
        })}
      </div>

      {/* Register Button */}
      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Register Now"}
      </button>

      {/* DAU Free Notice */}
      {event.is_dau_free && (
        <p className="text-xs text-green-600 mt-2 text-center">
          * Free for verified DAU students (Login with @dau.ac.in email)
        </p>
      )}
    </div>
  );
}
