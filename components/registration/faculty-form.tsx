"use client";

import axios, { AxiosError } from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Link from "next/link";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { facultyRegistrationSchema } from "@/validations/registration";

export function FacultyRegistrationForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const initialValues = {
    name: "",
    fatherName: "",
    email: "",
    phone: "",
    password: "",
    employeeId: "",
    department: "",
    designation: "",
    facultyType: "",
    universityIdCardUrl: "",
    employmentVerificationUrl: "",
  };

  if (isSuccess) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-900 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-200 space-y-4">
        <h4 className="text-lg font-semibold">Registration Submitted!</h4>
        <p className="text-sm">
          Your faculty account has been registered with status{" "}
          <span className="font-bold underline">PENDING</span>. The Super Admin
          will review and approve your account before you can place orders.
        </p>
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsSuccess(false);
              setServerError(null);
            }}
          >
            Register Another Account
          </Button>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={facultyRegistrationSchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        setServerError(null);
        try {
          await axios.post("/api/auth/register/faculty", values);
          setIsSuccess(true);
          resetForm();
        } catch (err: unknown) {
          if (err instanceof AxiosError && err.response?.data?.error) {
            setServerError(err.response.data.error);
          } else {
            setServerError(
              "An unexpected error occurred during registration. Please try again."
            );
          }
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          {serverError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive font-medium">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="faculty-name">Full Name *</Label>
              <Field
                as={Input}
                id="faculty-name"
                name="name"
                placeholder="e.g. Dr. Jane Smith"
              />
              <ErrorMessage
                name="name"
                component="p"
                className="text-xs text-destructive mt-1"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="faculty-fatherName">Father Name *</Label>
              <Field
                as={Input}
                id="faculty-fatherName"
                name="fatherName"
                placeholder="e.g. Richard Smith"
              />
              <ErrorMessage
                name="fatherName"
                component="p"
                className="text-xs text-destructive mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="faculty-email">Email Address *</Label>
              <Field
                as={Input}
                id="faculty-email"
                name="email"
                type="email"
                placeholder="jane.smith@uni.edu"
              />
              <ErrorMessage
                name="email"
                component="p"
                className="text-xs text-destructive mt-1"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="faculty-phone">Phone Number *</Label>
              <Field
                as={Input}
                id="faculty-phone"
                name="phone"
                placeholder="e.g. 03009876543"
              />
              <ErrorMessage
                name="phone"
                component="p"
                className="text-xs text-destructive mt-1"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="faculty-password">Password *</Label>
            <Field
              as={Input}
              id="faculty-password"
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
            />
            <ErrorMessage
              name="password"
              component="p"
              className="text-xs text-destructive mt-1"
            />
          </div>

          <div className="border-t border-border pt-3 mt-4">
            <h5 className="text-sm font-semibold text-foreground mb-3">
              Faculty & Department Information
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="faculty-employeeId">Employee ID *</Label>
                <Field
                  as={Input}
                  id="faculty-employeeId"
                  name="employeeId"
                  placeholder="e.g. EMP-1042"
                />
                <ErrorMessage
                  name="employeeId"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="faculty-department">Department *</Label>
                <Field
                  as={Input}
                  id="faculty-department"
                  name="department"
                  placeholder="e.g. Electrical Engineering"
                />
                <ErrorMessage
                  name="department"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="faculty-designation">Designation *</Label>
                <Field
                  as={Input}
                  id="faculty-designation"
                  name="designation"
                  placeholder="e.g. Assistant Professor"
                />
                <ErrorMessage
                  name="designation"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="space-y-1.5">
                <Label htmlFor="faculty-facultyType">Faculty Type *</Label>
                <Field
                  as={Input}
                  id="faculty-facultyType"
                  name="facultyType"
                  placeholder="e.g. Permanent, Visiting"
                />
                <ErrorMessage
                  name="facultyType"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="faculty-universityIdCardUrl">
                  University ID Card URL (Optional)
                </Label>
                <Field
                  as={Input}
                  id="faculty-universityIdCardUrl"
                  name="universityIdCardUrl"
                  placeholder="ID Card photo or doc URL"
                />
                <ErrorMessage
                  name="universityIdCardUrl"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="faculty-employmentVerificationUrl">
                  Employment Verification URL (Optional)
                </Label>
                <Field
                  as={Input}
                  id="faculty-employmentVerificationUrl"
                  name="employmentVerificationUrl"
                  placeholder="Verification document URL"
                />
                <ErrorMessage
                  name="employmentVerificationUrl"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
            {isSubmitting ? "Submitting Registration..." : "Register as Faculty Member"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
