"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/providers/AuthProvider";

export function DeleteAccountButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signOut } = useAuth();

  const handleDelete = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to delete account");
      }
      await signOut();
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  const canConfirm = confirmText === "DELETE";

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setConfirmText("");
          setError(null);
          setDialogOpen(true);
        }}
        className="text-xs text-[var(--on-surface-variant)] hover:text-red-600 hover:border-red-200"
      >
        Delete Account
      </Button>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Delete your account?"
        description="This action is permanent and cannot be undone. All your data — including generations, content, and subscription — will be permanently deleted."
      >
        <div className="space-y-4">
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="text-xs text-[var(--on-surface-variant)]">
              Type <strong>DELETE</strong> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="mt-1.5 w-full rounded-lg border border-[var(--outline-variant)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isLoading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={!canConfirm || isLoading}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-1.5" />
                  Deleting...
                </>
              ) : (
                "Delete Forever"
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
