"use client";

import axios from "axios";
import { Formik } from "formik";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productInputSchema, type ProductInput } from "@/validations/marketplace";

type CategoryOption = { _id: string; name: string; isActive: boolean };
type ProductItem = Omit<ProductInput, "category"> & {
  _id: string;
  category: CategoryOption;
};
type ApiResponse<T> = { data: T };
const emptyProduct: ProductInput = {
  name: "", description: "", category: "", price: 0, discountPrice: undefined,
  image: "", stockQuantity: 0, isAvailable: true, preparationTime: 10,
};

function errorMessage(error: unknown) {
  return axios.isAxiosError<{ error?: string }>(error)
    ? error.response?.data.error ?? "The product could not be saved."
    : "The product could not be saved.";
}

export function ProductManager() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [editing, setEditing] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [productResponse, categoryResponse] = await Promise.all([
        axios.get<ApiResponse<ProductItem[]>>("/api/owner/products"),
        axios.get<ApiResponse<CategoryOption[]>>("/api/owner/categories"),
      ]);
      setProducts(productResponse.data.data);
      setCategories(categoryResponse.data.data);
      setError("");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      axios.get<ApiResponse<ProductItem[]>>("/api/owner/products"),
      axios.get<ApiResponse<CategoryOption[]>>("/api/owner/categories"),
    ])
      .then(([productResponse, categoryResponse]) => {
        if (!active) return;
        setProducts(productResponse.data.data);
        setCategories(categoryResponse.data.data);
      })
      .catch((cause: unknown) => { if (active) setError(errorMessage(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function save(values: ProductInput, setSubmitting: (value: boolean) => void) {
    setError("");
    setNotice("");
    try {
      if (editing) {
        await axios.patch(`/api/owner/products/${editing._id}`, values);
        setNotice("Product updated.");
      } else {
        await axios.post("/api/owner/products", values);
        setNotice("Product created.");
      }
      setEditing(null);
      await load();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  }

  async function markUnavailable(product: ProductItem) {
    if (!window.confirm(`Mark “${product.name}” as unavailable?`)) return;
    try {
      await axios.delete(`/api/owner/products/${product._id}`);
      setNotice("Product marked unavailable.");
      await load();
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }

  const initialValues: ProductInput = editing
    ? { ...editing, category: editing.category._id }
    : emptyProduct;
  const activeCategories = categories.filter((category) => category.isActive);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <Card>
        <CardHeader><CardTitle>{editing ? "Edit product" : "Add a product"}</CardTitle><CardDescription>Set clear details, pricing, stock and availability.</CardDescription></CardHeader>
        <CardContent>
          {activeCategories.length === 0 && !editing ? <p className="text-sm text-muted-foreground">Create an active category before adding products.</p> : (
            <Formik<ProductInput>
              key={editing?._id ?? "new-product"}
              initialValues={initialValues}
              validationSchema={productInputSchema}
              onSubmit={(values, helpers) => save(values, helpers.setSubmitting)}
            >
              {({ values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit }) => (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div><Label htmlFor="product-name">Name</Label><Input id="product-name" name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} maxLength={100} className="mt-2" aria-invalid={Boolean(touched.name && errors.name)} />{touched.name && errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}</div>
                  <div><Label htmlFor="product-description">Description</Label><textarea id="product-description" name="description" value={values.description} onChange={handleChange} onBlur={handleBlur} maxLength={1000} rows={3} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />{touched.description && errors.description && <p className="mt-1 text-sm text-destructive">{errors.description}</p>}</div>
                  <div><Label htmlFor="product-category">Category</Label><select id="product-category" name="category" value={values.category} onChange={handleChange} onBlur={handleBlur} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Choose a category</option>{categories.map((category) => <option key={category._id} value={category._id} disabled={!category.isActive}>{category.name}{category.isActive ? "" : " (inactive)"}</option>)}</select>{touched.category && errors.category && <p className="mt-1 text-sm text-destructive">{errors.category}</p>}</div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label htmlFor="product-price">Price (PKR)</Label><Input id="product-price" name="price" type="number" min="0" step="0.01" value={values.price} onChange={handleChange} onBlur={handleBlur} className="mt-2" />{touched.price && errors.price && <p className="mt-1 text-sm text-destructive">{errors.price}</p>}</div>
                    <div><Label htmlFor="product-discount">Discount price (optional)</Label><Input id="product-discount" name="discountPrice" type="number" min="0" step="0.01" value={values.discountPrice ?? ""} onChange={handleChange} onBlur={handleBlur} className="mt-2" />{touched.discountPrice && errors.discountPrice && <p className="mt-1 text-sm text-destructive">{errors.discountPrice}</p>}</div>
                    <div><Label htmlFor="product-stock">Stock quantity</Label><Input id="product-stock" name="stockQuantity" type="number" min="0" step="1" value={values.stockQuantity} onChange={handleChange} onBlur={handleBlur} className="mt-2" />{touched.stockQuantity && errors.stockQuantity && <p className="mt-1 text-sm text-destructive">{errors.stockQuantity}</p>}</div>
                    <div><Label htmlFor="product-prep">Preparation time (minutes)</Label><Input id="product-prep" name="preparationTime" type="number" min="1" max="240" step="1" value={values.preparationTime} onChange={handleChange} onBlur={handleBlur} className="mt-2" />{touched.preparationTime && errors.preparationTime && <p className="mt-1 text-sm text-destructive">{errors.preparationTime}</p>}</div>
                  </div>
                  <div><Label htmlFor="product-image">Image URL (optional)</Label><Input id="product-image" name="image" type="url" value={values.image} onChange={handleChange} onBlur={handleBlur} className="mt-2" />{touched.image && errors.image && <p className="mt-1 text-sm text-destructive">{errors.image}</p>}</div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isAvailable" checked={values.isAvailable} onChange={handleChange} />Available in marketplace</label>
                  <div className="flex gap-2"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : editing ? "Save changes" : "Add product"}</Button>{editing && <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>}</div>
                </form>
              )}
            </Formik>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your products</CardTitle><CardDescription>Only products marked available and in stock appear in the marketplace.</CardDescription></CardHeader>
        <CardContent>
          {error && <p role="alert" className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {notice && <p role="status" className="mb-4 rounded-md bg-secondary p-3 text-sm">{notice}</p>}
          {loading ? <p role="status" className="text-sm text-muted-foreground">Loading products…</p> : products.length === 0 ? <p className="text-sm text-muted-foreground">No products yet. Add a product to your canteen.</p> : (
            <ul className="divide-y">
              {products.map((product) => (
                <li key={product._id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0"><p className="font-medium">{product.name}</p><p className="text-sm text-muted-foreground">{product.category?.name ?? "No category"} · PKR {product.price.toFixed(2)}{product.isAvailable ? "" : " · Unavailable"}</p></div>
                  <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(product)}>Edit</Button>{product.isAvailable && <Button size="sm" variant="ghost" onClick={() => void markUnavailable(product)}>Deactivate</Button>}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
