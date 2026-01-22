"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  ArrowLeft,
  Music,
  Loader2,
  Upload,
  X,
  AlertCircle,
} from "lucide-react";
import { cropImage } from "@/lib/clientImageUtils";

type Concert = {
  id: number;
  concert_name: string;
};

type Artist = {
  id: number;
  name: string;
  concert_id: number;
  genre?: string;
  reveal_date: string;
  bio?: string;
  artist_image_url?: string;
  concert?: {
    concert_name: string;
  };
};

export default function EditArtistPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    concert_id: "",
    genre: "",
    reveal_date: "",
    bio: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch concerts
        const concertsRes = await fetch("/api/admin/concerts");
        const concertsData = await concertsRes.json();
        setConcerts(concertsData || []);

        // Fetch artist
        const artistRes = await fetch("/api/admin/artists");
        const artistsData = await artistRes.json();
        const foundArtist = artistsData.find(
          (a: Artist) => a.id === Number(id),
        );

        if (!foundArtist) {
          setError("Artist not found");
          setLoadingData(false);
          return;
        }

        setArtist(foundArtist);
        setFormData({
          name: foundArtist.name,
          concert_id: foundArtist.concert_id.toString(),
          genre: foundArtist.genre || "",
          reveal_date: foundArtist.reveal_date?.split("T")[0] || "",
          bio: foundArtist.bio || "",
        });

        // Set existing image as preview
        if (foundArtist.artist_image_url) {
          setImagePreview(foundArtist.artist_image_url);
        }

        setLoadingData(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load artist data");
        setLoadingData(false);
      }
    };
    fetchData();
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

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.concert_id || !formData.reveal_date) {
      alert("Name, Concert, and Reveal Date are required");
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("id", id);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("concert_id", formData.concert_id);
      formDataToSend.append("genre", formData.genre || "");
      formDataToSend.append("reveal_date", formData.reveal_date);
      formDataToSend.append("bio", formData.bio || "");

      // Crop and append image if a new file was uploaded
      if (imageFile) {
        const croppedImage = await cropImage(imageFile, 3, 2);
        formDataToSend.append("image", croppedImage);
      }

      const res = await fetch("/api/admin/artists", {
        method: "PUT",
        body: formDataToSend,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      alert("Artist updated successfully!");
      router.push("/admin/artists");
    } catch (err: unknown) {
      alert(
        "Failed to update artist: " +
          (err instanceof Error ? err.message : "Failed to update artist"),
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-muted-foreground">
          Error: {error || "Artist not found"}
        </p>
        <Link href="/admin/artists">
          <Button variant="outline">Back to Artists</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <AdminPageHeader
        title="Edit Artist"
        subtitle={artist.name}
        actions={
          <Link href="/admin/artists">
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
              <Music className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Artist Details</CardTitle>
              <CardDescription>Update performer information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Artist Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Artist name"
                  required
                  className="bg-muted/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Concert *</label>
                <Select
                  value={formData.concert_id}
                  onValueChange={(v) =>
                    setFormData({ ...formData, concert_id: v })
                  }
                >
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue placeholder="Select concert" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {concerts.map((concert) => (
                      <SelectItem
                        key={concert.id}
                        value={concert.id.toString()}
                      >
                        {concert.concert_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Genre</label>
                <Input
                  value={formData.genre}
                  onChange={(e) =>
                    setFormData({ ...formData, genre: e.target.value })
                  }
                  placeholder="e.g., Pop, Rock, EDM"
                  className="bg-muted/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reveal Date *</label>
                <Input
                  type="date"
                  value={formData.reveal_date}
                  onChange={(e) =>
                    setFormData({ ...formData, reveal_date: e.target.value })
                  }
                  required
                  className="bg-muted/50 border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Artist Image</label>
              <div className="space-y-4">
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
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Click to upload artist image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Image will be cropped to 600x400 (3:2 ratio)
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full h-auto rounded-lg"
                        style={{ maxHeight: "400px" }}
                      />
                      {/* 600x400 highlight overlay */}
                      <div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{
                          width: "600px",
                          height: "400px",
                          maxWidth: "100%",
                          maxHeight: "100%",
                          aspectRatio: "3/2",
                        }}
                      >
                        <div className="w-full h-full border-4 border-primary/60 rounded-lg shadow-lg"></div>
                      </div>
                      {/* Dark overlay outside the crop area */}
                      <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full">
                          <defs>
                            <mask id="crop-mask-edit">
                              <rect width="100%" height="100%" fill="white" />
                              <rect
                                x="50%"
                                y="50%"
                                width="600"
                                height="400"
                                transform="translate(-300, -200)"
                                fill="black"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                }}
                              />
                            </mask>
                          </defs>
                          <rect
                            width="100%"
                            height="100%"
                            fill="rgba(0,0,0,0.5)"
                            mask="url(#crop-mask-edit)"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="border-border/50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove Image
                      </Button>
                      <p className="text-xs text-muted-foreground self-center">
                        {imageFile
                          ? "Highlighted area (600x400) will be saved"
                          : "Current image - upload new to replace"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full rounded-md border border-border/50 bg-muted/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                placeholder="Artist biography"
              />
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
                    Updating...
                  </>
                ) : (
                  "Update Artist"
                )}
              </Button>
              <Link href="/admin/artists">
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
