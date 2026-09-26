"use client";

import axios, { AxiosError } from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Link from "next/link";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { studentRegistrationSchema } from "@/validations/registration";

export function StudentRegistrationForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const initialValues = {
    name: "",
    fatherName: "",
    email: "",
    phone: "",
    password: "",
    studentId: "",
    department: "",
    program: "",
    semester: "",
    section: "",
    studentCardUrl: "",
    universityEmail: "",
  };

  if (isSuccess) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-900 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-200 space-y-4">
        <h4 className="text-lg font-semibold">Registration Submitted!</h4>
        <p className="text-sm">
          Your student account has been registered with status{" "}
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
      validationSchema={studentRegistrationSchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        setServerError(null);
        try {
          await axios.post("/api/auth/register/student", values);
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
              <Label htmlFor="name">Full Name *</Label>
              <Field
                as={Input}
                id="name"
                name="name"
                placeholder="e.g. John Doe"
              />
              <ErrorMessage
                name="name"
                component="p"
                className="text-xs text-destructive mt-1"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fatherName">Father Name *</Label>
              <Field
                as={Input}
                id="fatherName"
                name="fatherName"
                placeholder="e.g. Robert Doe"
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
              <Label htmlFor="email">Email Address *</Label>
              <Field
                as={Input}
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
              />
              <ErrorMessage
                name="email"
                component="p"
                className="text-xs text-destructive mt-1"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number *</Label>
              <Field
                as={Input}
                id="phone"
                name="phone"
                placeholder="e.g. 03001234567"
              />
              <ErrorMessage
                name="phone"
                component="p"
                className="text-xs text-destructive mt-1"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password *</Label>
            <Field
              as={Input}
              id="password"
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
              Academic Information
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="studentId">Student ID / Roll No *</Label>
                <Field
                  as={Input}
                  id="studentId"
                  name="studentId"
                  placeholder="e.g. FA20-BCS-001"
                />
                <ErrorMessage
                  name="studentId"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="department">Department *</Label>
                <Field
                  as={Input}
                  id="department"
                  name="department"
                  placeholder="e.g. Computer Science"
                />
                <ErrorMessage
                  name="department"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="space-y-1.5">
                <Label htmlFor="program">Program *</Label>
                <Field
                  as={Input}
                  id="program"
                  name="program"
                  placeholder="e.g. BSCS"
                />
                <ErrorMessage
                  name="program"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="semester">Semester *</Label>
                <Field
                  as={Input}
                  id="semester"
                  name="semester"
                  placeholder="e.g. 5th"
                />
                <ErrorMessage
                  name="semester"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="section">Section *</Label>
                <Field
                  as={Input}
                  id="section"
                  name="section"
                  placeholder="e.g. A"
                />
                <ErrorMessage
                  name="section"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="space-y-1.5">
                <Label htmlFor="universityEmail">
                  University Email (Optional)
                </Label>
                <Field
                  as={Input}
                  id="universityEmail"
                  name="universityEmail"
                  type="email"
                  placeholder="e.g. student@uni.edu"
                />
                <ErrorMessage
                  name="universityEmail"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="studentCardUrl">
                  Student Card URL / Reference (Optional)
                </Label>
                <Field
                  as={Input}
                  id="studentCardUrl"
                  name="studentCardUrl"
                  placeholder="Card photo or reference URL"
                />
                <ErrorMessage
                  name="studentCardUrl"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
            {isSubmitting ? "Submitting Registration..." : "Register as Student"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
