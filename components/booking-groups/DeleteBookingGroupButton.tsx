"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type DeleteBookingGroupButtonProps = {
  id: number;
  name: string;
};

export default function DeleteBookingGroupButton({
  id,
  name,
}: DeleteBookingGroupButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/booking-groups/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      const message = data.error ?? "Failed to delete";
      setError(message);
      toast.error(message);
      setLoading(false);
      return;
    }

    toast.success("Group booking deleted successfully");
    setConfirmOpen(false);
    router.push("/booking-groups");
    router.refresh();
    setLoading(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setConfirmOpen(true);
        }}
        disabled={loading}
        className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-red-50 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 sm:h-9 sm:min-w-[72px] sm:w-auto"
      >
        {loading ? "..." : "Delete"}
      </button>
      {confirmOpen && (
        <ConfirmDialog
          title="Delete this group booking?"
          description={`Are you sure you want to delete "${name}"? All linked room bookings will be removed.`}
          confirmLabel="OK"
          loading={loading}
          error={error}
          onCancel={() => {
            if (!loading) setConfirmOpen(false);
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
