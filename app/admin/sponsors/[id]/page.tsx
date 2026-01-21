"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { ArrowLeft, Building2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

const PREDEFINED_TIERS = ["Title", "Co-Title", "Platinum", "Associate"];

export default function EditSponsorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    tier: "",
    customTier: "",
    website_url: "",
    logo_url: "",
    rank: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchSponsor = async () => {
      try {
        const res = await fetch(`/api/admin/sponsors/${id}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const sponsorTier = data.sponsor.tier || "";
        const isCustomTier = !PREDEFINED_TIERS.includes(sponsorTier);

        setFormData({
          name: data.sponsor.name || "",
          tier: isCustomTier ? "Other" : sponsorTier,
          customTier: isCustomTier ? sponsorTier : "",
          website_url: data.sponsor.website_url || "",
          logo_url: data.sponsor.logo_url || "",
          rank: data.sponsor.rank ? String(data.sponsor.rank) : "",
        });

        if (data.sponsor.logo_url) {
          setImagePreview(data.sponsor.logo_url);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchSponsor();
  }, [id]);

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

    const finalTier =
      formData.tier === "Other" ? formData.customTier : formData.tier;

    if (!formData.name || !finalTier) {
      alert("Name and Tier are required");
      return;
    }

    setSaving(true);
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("tier", finalTier);
      if (formData.website_url) {
        submitData.append("website_url", formData.website_url);
      }
      if (formData.rank) {
        submitData.append("rank", formData.rank);
      }
      if (imageFile) {
        submitData.append("image", imageFile);
      }

      const res = await fetch(`/api/admin/sponsors/${id}`, {
        method: "PUT",
        body: submitData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      alert("Sponsor updated successfully!");
      router.push("/admin/sponsors");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert("Failed to update sponsor: " + errorMessage);
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
        <Link href="/admin/sponsors">
          <Button variant="outline">Back to Sponsors</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <AdminPageHeader
        title="Edit Sponsor"
        subtitle="Update Details"
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
              <CardDescription>Update sponsor information</CardDescription>
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
                <label className="text-sm font-medium">Tier *</label>
                <Select
                  value={formData.tier}
                  onValueChange={(v) => setFormData({ ...formData, tier: v })}
                >
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="Title">🏆 Title</SelectItem>
                    <SelectItem value="Co-Title">🤝 Co-Title</SelectItem>
                    <SelectItem value="Platinum">💎 Platinum</SelectItem>
                    <SelectItem value="Associate">🔗 Associate</SelectItem>
                    <SelectItem value="Other">✏️ Other (Specify)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.tier === "Other" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Custom Tier Name *
                </label>
                <Input
                  value={formData.customTier}
                  onChange={(e) =>
                    setFormData({ ...formData, customTier: e.target.value })
                  }
                  placeholder="Enter custom tier name"
                  required
                  className="bg-muted/50 border-border/50"
                />
              </div>
            )}

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
              <label className="text-sm font-medium">Rank (Optional)</label>
              <Input
                type="number"
                min="1"
                value={formData.rank}
                onChange={(e) =>
                  setFormData({ ...formData, rank: e.target.value })
                }
                placeholder="Enter rank number"
                className="bg-muted/50 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first. Leave empty to unset rank.
              </p>
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
              {formData.logo_url && !imageFile && (
                <p className="text-xs text-muted-foreground">
                  Current logo is displayed. Upload a new file to replace it.
                </p>
              )}
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
