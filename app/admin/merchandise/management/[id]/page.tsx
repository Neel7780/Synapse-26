"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/ui/AdminSidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  ArrowLeft,
  Package,
  Loader2,
  AlertCircle,
  Upload,
  X,
} from "lucide-react";

const TARGET_WIDTH = 750;
const TARGET_HEIGHT = 875;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    product_name: "",
    price: "",
    available_sizes: "",
    description: "",
    is_available: true,
  });

  const cropImageToRatio = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const targetRatio = TARGET_WIDTH / TARGET_HEIGHT;
        const imgRatio = imgWidth / imgHeight;

        let cropWidth, cropHeight, cropX, cropY;

        if (imgRatio > targetRatio) {
          cropHeight = imgHeight;
          cropWidth = imgHeight * targetRatio;
          cropX = (imgWidth - cropWidth) / 2;
          cropY = 0;
        } else {
          cropWidth = imgWidth;
          cropHeight = imgWidth / targetRatio;
          cropX = 0;
          cropY = (imgHeight - cropHeight) / 2;
        }

        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;

        ctx?.drawImage(
          img,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          TARGET_WIDTH,
          TARGET_HEIGHT,
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          "image/jpeg",
          0.95,
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    try {
      const cropped = await cropImageToRatio(file);
      setCroppedBlob(cropped);
    } catch (error) {
      console.error("Error cropping image:", error);
      alert("Failed to process image");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setCroppedBlob(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
          description: data.product.description || "",
          is_available: data.product.is_available ?? true,
        });
        if (data.product.product_image) {
          setExistingImageUrl(data.product.product_image);
          setImagePreview(data.product.product_image);
        }
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
      const formDataToSend = new FormData();
      formDataToSend.append("product_name", formData.product_name);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("is_available", formData.is_available.toString());

      if (formData.available_sizes) {
        const sizesArray = formData.available_sizes
          .split(",")
          .map((s) => s.trim());
        formDataToSend.append("available_sizes", JSON.stringify(sizesArray));
      }

      if (croppedBlob) {
        const croppedFile = new File(
          [croppedBlob],
          imageFile?.name || "product.jpg",
          {
            type: "image/jpeg",
          },
        );
        formDataToSend.append("image", croppedFile);
      }

      const res = await fetch(`/api/admin/merchandise/management/${id}`, {
        method: "PUT",
        body: formDataToSend,
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
                  onChange={(e) =>
                    setFormData({ ...formData, product_name: e.target.value })
                  }
                  required
                  className="bg-muted/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹) *</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                  className="bg-muted/50 border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Available Sizes (comma-separated)
              </label>
              <Input
                value={formData.available_sizes}
                onChange={(e) =>
                  setFormData({ ...formData, available_sizes: e.target.value })
                }
                placeholder="S, M, L, XL"
                className="bg-muted/50 border-border/50"
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Image</label>
              <div className="space-y-3">
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Click to upload product image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Image will be cropped to 750×875 (6:7 ratio)
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full h-auto max-h-96 rounded-lg"
                        style={{
                          boxShadow: "0 0 0 3px rgba(var(--primary), 0.3)",
                        }}
                      />
                      {imageFile && (
                        <div
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-primary pointer-events-none"
                          style={{
                            width: "300px",
                            height: "350px",
                            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                          }}
                        >
                          <div className="absolute -top-6 left-0 right-0 text-center">
                            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                              750×875 Crop Area
                            </span>
                          </div>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {imageFile ? (
                      <p className="text-xs text-muted-foreground">
                        Highlighted area shows the portion that will be saved
                        (750×875 pixels)
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          Current product image
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-replace"
                        />
                        <label htmlFor="image-replace">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <span className="cursor-pointer">
                              Replace Image
                            </span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-md border border-border/50 bg-muted/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_available"
                checked={formData.is_available}
                onChange={(e) =>
                  setFormData({ ...formData, is_available: e.target.checked })
                }
                className="rounded border-border"
              />
              <label htmlFor="is_available" className="text-sm font-medium">
                Available for purchase
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Link href="/admin/merchandise/management">
                <Button
                  type="button"
                  variant="outline"
                  className="border-border/50"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
