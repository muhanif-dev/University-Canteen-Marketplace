"use client";

import axios from "axios";
import { Formik } from "formik";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categoryInputSchema, type CategoryInput } from "@/validations/marketplace";

type CategoryItem = CategoryInput & { _id: string };
type ApiResponse<T> = { data: T };
const emptyCategory: CategoryInput = { name: "", description: "", isActive: true };

function getError(error: unknown) {
  return axios.isAxiosError<{ error?: string }>(error)
    ? error.response?.data.error ?? "The category could not be saved."
    : "The category could not be saved.";
}

export function CategoryManager() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse<CategoryItem[]>>("/api/owner/categories");
      setCategories(response.data.data);
      setError("");
    } catch (cause) {
      setError(getError(cause));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    axios.get<ApiResponse<CategoryItem[]>>("/api/owner/categories")
      .then(({ data }) => { if (active) setCategories(data.data); })
      .catch((cause: unknown) => { if (active) setError(getError(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function save(values: CategoryInput, setSubmitting: (value: boolean) => void) {
    setError("");
    setNotice("");
    try {
      if (editing) {
        await axios.patch(`/api/owner/categories/${editing._id}`, values);
        setNotice("Category updated.");
      } else {
        await axios.post("/api/owner/categories", values);
        setNotice("Category created.");
      }
      setEditing(null);
      await load();
    } catch (cause) {
      setError(getError(cause));
    } finally {
      setSubmitting(false);
    }
  }

  async function deactivate(category: CategoryItem) {
    if (!window.confirm(`Deactivate “${category.name}”? Its products will no longer appear in the marketplace.`)) return;
    try {
      await axios.delete(`/api/owner/categories/${category._id}`);
      setNotice("Category deactivated.");
      await load();
    } catch (cause) {
      setError(getError(cause));
    }
  }

  const initialValues = editing ?? emptyCategory;
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit category" : "Add a category"}</CardTitle>
          <CardDescription>Categories organize products for your canteen.</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik<CategoryInput>
            key={editing?._id ?? "new-category"}
            initialValues={initialValues}
            validationSchema={categoryInputSchema}
            onSubmit={(values, helpers) => save(values, helpers.setSubmitting)}
          >
            {({ values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit }) => (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <Label htmlFor="category-name">Name</Label>
                  <Input id="category-name" name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} maxLength={60} className="mt-2" aria-invalid={Boolean(touched.name && errors.name)} />
                  {touched.name && errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="category-description">Description (optional)</Label>
                  <textarea id="category-description" name="description" value={values.description} onChange={handleChange} onBlur={handleBlur} rows={3} maxLength={300} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  {touched.description && errors.description && <p className="mt-1 text-sm text-destructive">{errors.description}</p>}
                </div>
                {editing && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" checked={values.isActive} onChange={handleChange} />Active in marketplace</label>}
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : editing ? "Save changes" : "Add category"}</Button>
                  {editing && <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>}
                </div>
              </form>
            )}
          </Formik>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your categories</CardTitle><CardDescription>Category names must be unique within your canteen.</CardDescription></CardHeader>
        <CardContent>
          {error && <p role="alert" className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {notice && <p role="status" className="mb-4 rounded-md bg-secondary p-3 text-sm">{notice}</p>}
          {loading ? <p role="status" className="text-sm text-muted-foreground">Loading categories…</p> : categories.length === 0 ? <p className="text-sm text-muted-foreground">No categories yet. Add one to organize your products.</p> : (
            <ul className="divide-y">
              {categories.map((category) => (
                <li key={category._id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                  <div><p className="font-medium">{category.name} {!category.isActive && <span className="text-xs text-muted-foreground">(inactive)</span>}</p><p className="text-sm text-muted-foreground">{category.description || "No description"}</p></div>
                  <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(category)}>Edit</Button>{category.isActive && <Button size="sm" variant="ghost" onClick={() => void deactivate(category)}>Deactivate</Button>}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
