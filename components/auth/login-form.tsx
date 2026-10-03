"use client";

import axios from "axios";
import { Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiResponse } from "@/types/marketplace";
import { ROLES } from "@/types";
import { loginSchema, type LoginInput } from "@/validations/auth";

interface LoginResponse {
  user: { id: string; name: string; role: (typeof ROLES)[keyof typeof ROLES] };
}

const initialValues: LoginInput = { email: "", password: "" };

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={loginSchema}
      onSubmit={async (values, { setSubmitting }) => {
        setServerError("");
        try {
          const response = await axios.post<ApiResponse<LoginResponse>>(
            "/api/auth/login",
            values
          );
          const role = response.data.data.user.role;
          router.replace(
            role === ROLES.CANTEEN_OWNER
              ? "/canteen-owner/dashboard"
              : role === ROLES.SUPER_ADMIN
                ? "/admin/registrations"
                : "/marketplace"
          );
          router.refresh();
        } catch (cause) {
          setServerError(
            axios.isAxiosError<{ error?: string }>(cause)
              ? cause.response?.data.error ?? "Sign in failed. Please try again."
              : "Sign in failed. Please try again."
          );
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, errors, touched, isSubmitting, handleChange, handleBlur }) => (
        <Form className="space-y-5">
          {serverError && (
            <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(touched.email && errors.email)}
              aria-describedby={touched.email && errors.email ? "email-error" : undefined}
              required
            />
            {touched.email && errors.email && (
              <p id="email-error" className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(touched.password && errors.password)}
              aria-describedby={touched.password && errors.password ? "password-error" : undefined}
              required
            />
            {touched.password && errors.password && (
              <p id="password-error" className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Accounts can sign in after their registration is approved.
          </p>
        </Form>
      )}
    </Formik>
  );
}
