"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/logout");
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Sign out failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end">
      <Button variant="outline" size="sm" onClick={() => void logout()} disabled={loading}>
        {loading ? "Signing out…" : "Sign out"}
      </Button>
      {error && <span role="alert" className="mt-1 text-xs text-destructive">{error}</span>}
    </div>
  );
}
