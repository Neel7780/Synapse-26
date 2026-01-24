"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import Link from "next/link";

type Category = {
  sponsor_category_id: number;
  tier: string;
  rank: number | null;
};

export default function NewSponsorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    website_url: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/admin/sponsor-categories");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        alert("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category_id) {
      alert("Name and Category are required");
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("category_id", formData.category_id);
      if (formData.website_url) {
        submitData.append("website_url", formData.website_url);
      }
      if (imageFile) {
        submitData.append("image", imageFile);
      }

      const res = await fetch("/api/admin/sponsors", {
        method: "POST",
        body: submitData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      alert("Sponsor created successfully!");
      router.push("/admin/sponsors");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert("Failed to create sponsor: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <AdminPageHeader
        title="Add Sponsor"
        subtitle="Create New"
        actions={
          <Link href="/admin/sponsors">
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
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Sponsor Details</CardTitle>
              <CardDescription>Add a new sponsor to your event</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sponsor Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Tech Corp"
                  required
                  className="bg-muted/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={formData.category_id}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category_id: v })
                  }
                  disabled={categoriesLoading}
                >
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue
                      placeholder={
                        categoriesLoading ? "Loading..." : "Select category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categories.map((category) => (
                      <SelectItem
                        key={category.sponsor_category_id}
                        value={String(category.sponsor_category_id)}
                      >
                        {category.tier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Website URL</label>
              <Input
                value={formData.website_url}
                onChange={(e) =>
                  setFormData({ ...formData, website_url: e.target.value })
                }
                placeholder="https://example.com"
                className="bg-muted/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Logo Upload</label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="bg-muted/50 border-border/50"
                />
                {imagePreview && (
                  <div className="relative h-20 w-20 rounded-lg border border-border/50 overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Sponsor"
                )}
              </Button>
              <Link href="/admin/sponsors">
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
