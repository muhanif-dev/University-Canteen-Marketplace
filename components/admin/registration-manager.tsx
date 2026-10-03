"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiResponse } from "@/types/marketplace";

interface Registration {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  profile: Record<string, unknown> | null;
}

interface RegistrationList {
  count: number;
  registrations: Registration[];
}

const profileLabels: Record<string, string> = {
  studentId: "Student ID",
  employeeId: "Employee ID",
  department: "Department",
  program: "Program",
  semester: "Semester",
  section: "Section",
  designation: "Designation",
  facultyType: "Faculty type",
  canteenName: "Canteen",
  location: "Location",
  building: "Building",
  openingTime: "Opening time",
  closingTime: "Closing time",
  cnic: "CNIC",
  universityEmail: "University email",
};

function displayValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}

export function RegistrationManager() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get<ApiResponse<RegistrationList>>("/api/admin/registrations?status=PENDING");
      setRegistrations(response.data.data.registrations);
    } catch (cause) {
      setError(axios.isAxiosError<{ error?: string }>(cause)
        ? cause.response?.data.error ?? "Could not load registration requests."
        : "Could not load registration requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function decide(id: string, action: "approve" | "reject") {
    setWorkingId(id);
    setError("");
    setNotice("");
    try {
      if (action === "approve") {
        await axios.post(`/api/admin/registrations/${id}/approve`);
        setNotice("Account approved and activated.");
      } else {
        const reason = reasons[id]?.trim() ?? "";
        if (reason.length < 3) {
          setError("Enter a rejection reason of at least 3 characters.");
          setWorkingId("");
          return;
        }
        await axios.post(`/api/admin/registrations/${id}/reject`, { reason });
        setNotice("Account request rejected.");
      }
      await load();
    } catch (cause) {
      setError(axios.isAxiosError<{ error?: string }>(cause)
        ? cause.response?.data.error ?? "Could not update this request."
        : "Could not update this request.");
    } finally {
      setWorkingId("");
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading requests…</p>;

  return (
    <section className="space-y-5">
      {error && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {notice && <p role="status" className="rounded-md bg-primary/10 p-3 text-sm">{notice}</p>}
      {registrations.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <h2 className="text-lg font-semibold">No pending requests</h2>
          <p className="mt-2 text-sm text-muted-foreground">New registration requests will appear here.</p>
        </div>
      ) : registrations.map((registration) => (
        <article key={registration._id} className="rounded-xl border bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{registration.role.replaceAll("_", " ")}</p>
              <h2 className="mt-1 text-lg font-semibold">{registration.name}</h2>
              <p className="text-sm text-muted-foreground">{registration.email} · {registration.phone}</p>
              <p className="mt-1 text-xs text-muted-foreground">Submitted {new Date(registration.createdAt).toLocaleString()}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={workingId !== ""}>Refresh</Button>
          </div>
          {registration.profile && (
            <dl className="mt-5 grid gap-x-6 gap-y-3 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(profileLabels).map(([field, label]) => {
                const value = displayValue(registration.profile?.[field]);
                return value ? <div key={field}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm">{value}</dd></div> : null;
              })}
            </dl>
          )}
          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <Input
              value={reasons[registration._id] ?? ""}
              onChange={(event) => setReasons((current) => ({ ...current, [registration._id]: event.target.value }))}
              placeholder="Rejection reason (required to reject)"
              maxLength={500}
              aria-label={`Rejection reason for ${registration.name}`}
            />
            <Button variant="outline" onClick={() => void decide(registration._id, "reject")} disabled={workingId !== ""}>
              {workingId === registration._id ? "Saving…" : "Reject"}
            </Button>
            <Button onClick={() => void decide(registration._id, "approve")} disabled={workingId !== ""}>
              {workingId === registration._id ? "Saving…" : "Approve"}
            </Button>
          </div>
        </article>
      ))}
    </section>
  );
}
