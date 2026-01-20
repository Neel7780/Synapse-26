"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/ui/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ArrowLeft, Package, Loader2, AlertCircle } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    product_name: "",
    price: "",
    available_sizes: "",
    product_image: "",
    description: "",
    is_available: true,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/merchandise/management/${id}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setFormData({
          product_name: data.product.product_name || "",
          price: data.product.price?.toString() || "",
          available_sizes: data.product.available_sizes?.join(", ") || "",
          product_image: data.product.product_image || "",
          description: data.product.description || "",
          is_available: data.product.is_available ?? true,
        });
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name || !formData.price) {
      alert("Name and Price are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/merchandise/management/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: formData.product_name,
          price: Number(formData.price),
          available_sizes: formData.available_sizes ? formData.available_sizes.split(",").map(s => s.trim()) : null,
          product_image: formData.product_image || null,
          description: formData.description || null,
          is_available: formData.is_available,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      alert("Product updated successfully!");
      router.push("/admin/merchandise/management");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      alert("Failed to update product: " + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-muted-foreground">Error: {error}</p>
        <Link href="/admin/merchandise/management">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <AdminPageHeader
        title="Edit Product"
        subtitle="Merchandise"
        actions={
          <Link href="/admin/merchandise/management">
            <Button variant="outline" className="border-border/50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />

      <Card className="border-border/40 max-w-2xl">
        <CardHeader className="border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Update product information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name *</label>
                <Input
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  required
                  className="bg-muted/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹) *</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="bg-muted/50 border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Available Sizes (comma-separated)</label>
              <Input
                value={formData.available_sizes}
                onChange={(e) => setFormData({ ...formData, available_sizes: e.target.value })}
                placeholder="S, M, L, XL"
                className="bg-muted/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product Image URL</label>
              <Input
                value={formData.product_image}
                onChange={(e) => setFormData({ ...formData, product_image: e.target.value })}
                className="bg-muted/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-md border border-border/50 bg-muted/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_available"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="rounded border-border"
              />
              <label htmlFor="is_available" className="text-sm font-medium">Available for purchase</label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
              </Button>
              <Link href="/admin/merchandise/management">
                <Button type="button" variant="outline" className="border-border/50">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
