"use client";

import axios from "axios";
import { Formik, type FormikHelpers } from "formik";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  canteenProfileSchema,
  canteenProfileUpdateSchema,
  type CanteenProfileInput,
} from "@/validations/canteen";

type ProfileResponse = { data: Omit<CanteenProfileInput, "cnic"> & { isApproved: boolean; isActive: boolean } };

const emptyProfile: CanteenProfileInput = {
  canteenName: "",
  description: "",
  location: "",
  building: "",
  openingTime: "",
  closingTime: "",
  cnic: "",
  logoUrl: "",
  coverImageUrl: "",
};

const fields: { name: keyof CanteenProfileInput; label: string; type?: string; wide?: boolean }[] = [
  { name: "canteenName", label: "Canteen name" },
  { name: "description", label: "Description", wide: true },
  { name: "location", label: "Location" },
  { name: "building", label: "Building / block" },
  { name: "openingTime", label: "Opening time", type: "time" },
  { name: "closingTime", label: "Closing time", type: "time" },
  { name: "logoUrl", label: "Logo image URL (optional)", wide: true },
  { name: "coverImageUrl", label: "Cover image URL (optional)", wide: true },
];

function apiMessage(error: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data.error ?? "Could not save the canteen profile. Please try again.";
  }
  return "Could not save the canteen profile. Please try again.";
}

export function CanteenProfileForm() {
  const [initialValues, setInitialValues] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [exists, setExists] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    axios.get<ProfileResponse>("/api/owner/canteen")
      .then(({ data }) => {
        if (!active) return;
        setInitialValues({ ...emptyProfile, ...data.data });
        setExists(true);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setExists(false);
        } else {
          setLoadError(apiMessage(error));
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function save(values: CanteenProfileInput, helpers: FormikHelpers<CanteenProfileInput>) {
    setSuccess("");
    setLoadError("");
    try {
      const response = await axios.request<ProfileResponse>({
        method: exists ? "PATCH" : "POST",
        url: "/api/owner/canteen",
        data: values,
      });
      setInitialValues({ ...emptyProfile, ...response.data.data });
      setExists(true);
      setSuccess(exists ? "Your canteen profile has been updated." : "Your canteen profile has been created.");
    } catch (error) {
      setLoadError(apiMessage(error));
    } finally {
      helpers.setSubmitting(false);
    }
  }

  if (loading) return <p role="status" className="text-sm text-muted-foreground">Loading your canteen profile…</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{exists ? "Canteen profile" : "Create your canteen profile"}</CardTitle>
        <CardDescription>Keep your public-facing canteen details and opening hours up to date.</CardDescription>
      </CardHeader>
      <CardContent>
        {loadError && <p role="alert" className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{loadError}</p>}
        {success && <p role="status" className="mb-4 rounded-md bg-secondary p-3 text-sm">{success}</p>}
        <Formik<CanteenProfileInput>
          initialValues={initialValues}
          enableReinitialize
          validationSchema={exists ? canteenProfileUpdateSchema : canteenProfileSchema}
          onSubmit={save}
        >
          {({ values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit }) => (
            <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2" noValidate>
              {!exists && <div>
                <Label htmlFor="canteen-cnic">Owner CNIC</Label>
                <Input id="canteen-cnic" name="cnic" value={values.cnic} onChange={handleChange} onBlur={handleBlur} autoComplete="off" aria-invalid={Boolean(touched.cnic && errors.cnic)} aria-describedby={touched.cnic && errors.cnic ? "canteen-cnic-error" : undefined} className="mt-2" />
                {touched.cnic && errors.cnic && <p id="canteen-cnic-error" className="mt-1 text-sm text-destructive">{errors.cnic}</p>}
              </div>}
              {fields.map(({ name, label, type, wide }) => {
                const id = `canteen-${name}`;
                const error = touched[name] ? errors[name] : undefined;
                return (
                  <div key={name} className={wide ? "sm:col-span-2" : ""}>
                    <Label htmlFor={id}>{label}</Label>
                    {name === "description" ? (
                      <textarea id={id} name={name} value={values[name]} onChange={handleChange} onBlur={handleBlur} rows={4} maxLength={1000} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    ) : (
                      <Input id={id} name={name} type={type ?? "text"} value={values[name]} onChange={handleChange} onBlur={handleBlur} maxLength={name === "canteenName" ? 100 : name === "location" ? 200 : name === "building" ? 100 : undefined} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className="mt-2" />
                    )}
                    {error && <p id={`${id}-error`} className="mt-1 text-sm text-destructive">{error}</p>}
                  </div>
                );
              })}
              <div className="sm:col-span-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : exists ? "Save changes" : "Create profile"}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}
