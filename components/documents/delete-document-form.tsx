"use client";

import { useState } from "react";

type DeleteDocumentFormProps = {
  action: () => void;
};

export function DeleteDocumentForm({ action }: DeleteDocumentFormProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
      >
        Delete document
      </button>
    );
  }

  return (
    <form action={action} className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-900">
        Delete this document? This cannot be undone.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
        >
          Yes, delete
        </button>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
