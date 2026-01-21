"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/ui/AdminSidebar";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ArrowLeft, Home, Loader2, AlertCircle } from "lucide-react";

export default function EditAccommodationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const [existingQrCode, setExistingQrCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    package_name: "",
    price: "",
    start_date: "",
    end_date: "",
    description: "",
    is_available: true,
  });

  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        const res = await fetch(`/api/admin/accommodation/${id}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        const pkg = data.package || data;
        setFormData({
          package_name: pkg.package_name || "",
          price: pkg.price?.toString() || "",
          start_date: pkg.start_date?.split("T")[0] || "",
          end_date: pkg.end_date?.split("T")[0] || "",
          description: pkg.description || "",
          is_available: pkg.is_available ?? true,
        });
        if (pkg.qr_code) {
          setExistingQrCode(pkg.qr_code);
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch accommodation",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAccommodation();
  }, [id]);

  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrCodeFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.package_name) {
      alert("Package name is required");
      return;
    }

    setSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("package_name", formData.package_name);
      if (formData.price) formDataToSend.append("price", formData.price);
      if (formData.start_date)
        formDataToSend.append("start_date", formData.start_date);
      if (formData.end_date)
        formDataToSend.append("end_date", formData.end_date);
      if (formData.description)
        formDataToSend.append("description", formData.description);
      formDataToSend.append("is_available", String(formData.is_available));
      if (qrCodeFile) formDataToSend.append("qr_code", qrCodeFile);

      const res = await fetch(`/api/admin/accommodation/${id}`, {
        method: "PUT",
        body: formDataToSend,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      alert("Package updated successfully!");
      router.push("/admin/accommodation");
    } catch (err: unknown) {
      alert(
        "Failed to update: " +
          (err instanceof Error ? err.message : "Failed to update package"),
      );
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
        <Link href="/admin/accommodation">
          <Button variant="outline">Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <AdminPageHeader
        title="Edit Package"
        subtitle="Accommodation"
        actions={
          <Link href="/admin/accommodation">
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
              <Home className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Package Details</CardTitle>
              <CardDescription>Update package information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Package Name *</label>
                <Input
                  value={formData.package_name}
                  onChange={(e) =>
                    setFormData({ ...formData, package_name: e.target.value })
                  }
                  required
                  className="bg-muted/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹)</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="bg-muted/50 border-border/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="bg-muted/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="bg-muted/50 border-border/50"
                />
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

            <div className="space-y-2">
              <label className="text-sm font-medium">QR Code</label>
              <div className="space-y-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleQrCodeChange}
                  className="bg-muted/50 border-border/50"
                />
                {(qrCodePreview || existingQrCode) && (
                  <div className="relative w-48 h-48 border border-border/50 rounded-lg overflow-hidden bg-muted/30">
                    <Image
                      src={qrCodePreview || existingQrCode || ""}
                      alt="QR Code"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
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
                Available for booking
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
              <Link href="/admin/accommodation">
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
