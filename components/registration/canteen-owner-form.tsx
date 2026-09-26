"use client";

import axios, { AxiosError } from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Link from "next/link";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { canteenOwnerRegistrationSchema } from "@/validations/registration";

export function CanteenOwnerRegistrationForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const initialValues = {
    name: "",
    fatherName: "",
    cnic: "",
    phone: "",
    email: "",
    password: "",
    canteenName: "",
    description: "",
    location: "",
    building: "",
    openingTime: "",
    closingTime: "",
    logoUrl: "",
    coverImageUrl: "",
    verificationDocuments: [] as string[],
  };

  if (isSuccess) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-900 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-200 space-y-4">
        <h4 className="text-lg font-semibold">Registration Submitted!</h4>
        <p className="text-sm">
          Your canteen owner account and canteen profile have been registered with status{" "}
          <span className="font-bold underline">PENDING</span>. The Super Admin
          will review your submitted information and approve your account before you can access the owner dashboard.
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
      validationSchema={canteenOwnerRegistrationSchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        setServerError(null);
        try {
          await axios.post("/api/auth/register/canteen-owner", values);
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

          <div>
            <h5 className="text-sm font-semibold text-foreground mb-3">
              Personal Information
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="owner-name">Full Name *</Label>
                <Field
                  as={Input}
                  id="owner-name"
                  name="name"
                  placeholder="e.g. Ali Khan"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="owner-fatherName">Father Name *</Label>
                <Field
                  as={Input}
                  id="owner-fatherName"
                  name="fatherName"
                  placeholder="e.g. Tariq Khan"
                />
                <ErrorMessage
                  name="fatherName"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="space-y-1.5">
                <Label htmlFor="owner-cnic">CNIC *</Label>
                <Field
                  as={Input}
                  id="owner-cnic"
                  name="cnic"
                  placeholder="e.g. 35201-1234567-1"
                />
                <ErrorMessage
                  name="cnic"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="owner-phone">Phone Number *</Label>
                <Field
                  as={Input}
                  id="owner-phone"
                  name="phone"
                  placeholder="e.g. 03211234567"
                />
                <ErrorMessage
                  name="phone"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="space-y-1.5">
                <Label htmlFor="owner-email">Email Address *</Label>
                <Field
                  as={Input}
                  id="owner-email"
                  name="email"
                  type="email"
                  placeholder="owner@example.com"
                />
                <ErrorMessage
                  name="email"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="owner-password">Password *</Label>
                <Field
                  as={Input}
                  id="owner-password"
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
            </div>
          </div>

          <div className="border-t border-border pt-3 mt-4">
            <h5 className="text-sm font-semibold text-foreground mb-3">
              Canteen Details
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="canteenName">Canteen Name *</Label>
                <Field
                  as={Input}
                  id="canteenName"
                  name="canteenName"
                  placeholder="e.g. Central Campus Cafeteria"
                />
                <ErrorMessage
                  name="canteenName"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="building">Building / Block *</Label>
                <Field
                  as={Input}
                  id="building"
                  name="building"
                  placeholder="e.g. Student Center, Block B"
                />
                <ErrorMessage
                  name="building"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>
            </div>

            <div className="space-y-1.5 mt-3">
              <Label htmlFor="location">Specific Location / Directions *</Label>
              <Field
                as={Input}
                id="location"
                name="location"
                placeholder="e.g. Ground Floor, opposite library"
              />
              <ErrorMessage
                name="location"
                component="p"
                className="text-xs text-destructive mt-1"
              />
            </div>

            <div className="space-y-1.5 mt-3">
              <Label htmlFor="description">Canteen Description *</Label>
              <Field
                as={Input}
                id="description"
                name="description"
                placeholder="Brief description of food options, cuisines, and specialty"
              />
              <ErrorMessage
                name="description"
                component="p"
                className="text-xs text-destructive mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="space-y-1.5">
                <Label htmlFor="openingTime">Opening Time *</Label>
                <Field
                  as={Input}
                  id="openingTime"
                  name="openingTime"
                  type="time"
                />
                <ErrorMessage
                  name="openingTime"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="closingTime">Closing Time *</Label>
                <Field
                  as={Input}
                  id="closingTime"
                  name="closingTime"
                  type="time"
                />
                <ErrorMessage
                  name="closingTime"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="space-y-1.5">
                <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
                <Field
                  as={Input}
                  id="logoUrl"
                  name="logoUrl"
                  placeholder="e.g. https://.../logo.png"
                />
                <ErrorMessage
                  name="logoUrl"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="coverImageUrl">Cover Image URL (Optional)</Label>
                <Field
                  as={Input}
                  id="coverImageUrl"
                  name="coverImageUrl"
                  placeholder="e.g. https://.../cover.png"
                />
                <ErrorMessage
                  name="coverImageUrl"
                  component="p"
                  className="text-xs text-destructive mt-1"
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
            {isSubmitting
              ? "Submitting Registration..."
              : "Register Canteen & Owner"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
