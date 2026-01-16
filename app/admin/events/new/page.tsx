"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AdminPageHeader } from "@/components/admin/ui/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { Badge } from "@/app/components/ui/badge";
import { TimePicker } from "@/app/components/ui/time-picker";

type ParticipationCategory = {
  enabled: boolean;
  fee: number;
  minParticipants?: number;
  maxParticipants?: number;
};

type EventFormData = {
  name: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  rulebookLink: string;
  description: string;
  imageUrl: string;
  registrationOpen: boolean;
  freeForDau: boolean;
  participationCategories: {
    solo: ParticipationCategory;
    duet: ParticipationCategory;
    group: ParticipationCategory;
  };
};

export default function CreateEventPage() {
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState("");

  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    category: "Technical",
    date: "",
    time: "",
    venue: "",
    rulebookLink: "",
    description: "",
    imageUrl: "",
    registrationOpen: true,
    freeForDau: false,
    participationCategories: {
      solo: { enabled: false, fee: 0 },
      duet: { enabled: false, fee: 0 },
      group: { enabled: false, fee: 0, minParticipants: 3, maxParticipants: 8 },
    },
  });

  const categories = ["Technical", "Cultural"];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setFormData({ ...formData, imageUrl: url });
    }
  };

  const handleParticipationToggle = (type: "solo" | "duet" | "group") => {
    setFormData((prev) => ({
      ...prev,
      participationCategories: {
        ...prev.participationCategories,
        [type]: {
          ...prev.participationCategories[type],
          enabled: !prev.participationCategories[type].enabled,
        },
      },
    }));
  };

  const handleParticipationFeeChange = (
    type: "solo" | "duet" | "group",
    fee: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      participationCategories: {
        ...prev.participationCategories,
        [type]: {
          ...prev.participationCategories[type],
          fee: Number(fee),
        },
      },
    }));
  };

  const handleGroupParticipantsChange = (
    field: "minParticipants" | "maxParticipants",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      participationCategories: {
        ...prev.participationCategories,
        group: {
          ...prev.participationCategories.group,
          [field]: Number(value),
        },
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Add API call to save event
    console.log("Creating event:", formData);
    // Redirect back to events list
    router.push("/admin/events");
  };

  return (
    <div className="space-y-6 pb-8">
      <AdminPageHeader
        title="Create New Event"
        subtitle="Events"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the core details about your event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Event Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Hackathon 2025"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">
                  Time <span className="text-destructive">*</span>
                </Label>
                <TimePicker
                  id="time"
                  value={formData.time}
                  onChange={(value) =>
                    setFormData({ ...formData, time: value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue">
                  Venue <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="venue"
                  type="text"
                  value={formData.venue}
                  onChange={(e) =>
                    setFormData({ ...formData, venue: e.target.value })
                  }
                  placeholder="Auditorium A, Ground Floor, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Event Picture</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer file:cursor-pointer"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="rulebook">Rulebook Google Drive Link</Label>
                <Input
                  id="rulebook"
                  type="url"
                  value={formData.rulebookLink}
                  onChange={(e) =>
                    setFormData({ ...formData, rulebookLink: e.target.value })
                  }
                  placeholder="https://drive.google.com/file/d/..."
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter event description..."
                />
              </div>
            </div>

            {/* Image Preview */}
            {previewImage && (
              <div className="mt-6 space-y-2">
                <Label>Image Preview</Label>
                <div className="relative inline-block">
                  <Image
                    src={previewImage}
                    alt="Event preview"
                    width={300}
                    height={300}
                    className="h-48 w-auto rounded-lg border border-border object-cover"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participation Categories */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Participation Categories & Fees</CardTitle>
            <CardDescription>
              Select allowed participation types and set their fixed registration fees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Solo */}
            <div className="space-y-4 rounded-lg border border-border/40 bg-secondary/20 p-4">
              <div className="flex items-center gap-4">
                <Switch
                  id="solo"
                  checked={formData.participationCategories.solo.enabled}
                  onCheckedChange={() => handleParticipationToggle("solo")}
                />
                <Label htmlFor="solo" className="text-base font-semibold cursor-pointer">
                  Solo (1 person)
                </Label>
              </div>
              {formData.participationCategories.solo.enabled && (
                <div className="ml-12 flex items-center gap-3">
                  <Label htmlFor="solo-fee" className="text-sm text-muted-foreground">
                    Fixed Fee:
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="solo-fee"
                      type="number"
                      value={formData.participationCategories.solo.fee}
                      onChange={(e) =>
                        handleParticipationFeeChange("solo", e.target.value)
                      }
                      className="w-32"
                      min={0}
                    />
                    <span className="text-sm text-muted-foreground">₹</span>
                  </div>
                </div>
              )}
            </div>

            {/* Duet */}
            <div className="space-y-4 rounded-lg border border-border/40 bg-secondary/20 p-4">
              <div className="flex items-center gap-4">
                <Switch
                  id="duet"
                  checked={formData.participationCategories.duet.enabled}
                  onCheckedChange={() => handleParticipationToggle("duet")}
                />
                <Label htmlFor="duet" className="text-base font-semibold cursor-pointer">
                  Duet (2 persons)
                </Label>
              </div>
              {formData.participationCategories.duet.enabled && (
                <div className="ml-12 flex items-center gap-3">
                  <Label htmlFor="duet-fee" className="text-sm text-muted-foreground">
                    Fixed Fee:
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="duet-fee"
                      type="number"
                      value={formData.participationCategories.duet.fee}
                      onChange={(e) =>
                        handleParticipationFeeChange("duet", e.target.value)
                      }
                      className="w-32"
                      min={0}
                    />
                    <span className="text-sm text-muted-foreground">₹</span>
                  </div>
                </div>
              )}
            </div>

            {/* Group/Team */}
            <div className="space-y-4 rounded-lg border border-border/40 bg-secondary/20 p-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Switch
                    id="group"
                    checked={formData.participationCategories.group.enabled}
                    onCheckedChange={() => handleParticipationToggle("group")}
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <Label htmlFor="group" className="text-base font-semibold cursor-pointer">
                    Team (Custom Range)
                  </Label>
                  {formData.participationCategories.group.enabled && (
                    <div className="space-y-4 rounded-lg border border-border bg-card/50 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="min-participants" className="text-sm">
                            Min Participants
                          </Label>
                          <Input
                            id="min-participants"
                            type="number"
                            value={
                              formData.participationCategories.group.minParticipants
                            }
                            onChange={(e) =>
                              handleGroupParticipantsChange(
                                "minParticipants",
                                e.target.value
                              )
                            }
                            min={3}
                            max={
                              formData.participationCategories.group.maxParticipants
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max-participants" className="text-sm">
                            Max Participants
                          </Label>
                          <Input
                            id="max-participants"
                            type="number"
                            value={
                              formData.participationCategories.group.maxParticipants
                            }
                            onChange={(e) =>
                              handleGroupParticipantsChange(
                                "maxParticipants",
                                e.target.value
                              )
                            }
                            min={
                              formData.participationCategories.group.minParticipants
                            }
                            max={20}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label htmlFor="group-fee" className="text-sm text-muted-foreground">
                          Fixed Team Fee:
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="group-fee"
                            type="number"
                            value={formData.participationCategories.group.fee}
                            onChange={(e) =>
                              handleParticipationFeeChange("group", e.target.value)
                            }
                            className="w-32"
                            min={0}
                          />
                          <span className="text-sm text-muted-foreground">₹</span>
                        </div>
                      </div>
                      <div className="space-y-2 rounded-md bg-secondary/30 p-3 text-xs">
                        <p className="text-muted-foreground">
                          Dropdown will show{" "}
                          <Badge variant="secondary" className="mx-1">
                            {formData.participationCategories.group.minParticipants}
                          </Badge>
                          to{" "}
                          <Badge variant="secondary" className="mx-1">
                            {formData.participationCategories.group.maxParticipants}
                          </Badge>
                          participants.
                        </p>
                        <p className="font-semibold text-foreground">
                          Fee is FIXED regardless of team size.
                        </p>
                        <p className="text-primary">
                          Example: Team of {formData.participationCategories.group.minParticipants}-
                          {formData.participationCategories.group.maxParticipants} = ₹
                          {formData.participationCategories.group.fee} (fixed)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Event Settings</CardTitle>
            <CardDescription>
              Configure registration and access settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Registration Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-secondary/20 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="registration" className="text-base font-semibold cursor-pointer">
                  Allow Registrations
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable event registrations
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="registration"
                  checked={formData.registrationOpen}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      registrationOpen: checked,
                    })
                  }
                />
                <Badge
                  variant={formData.registrationOpen ? "default" : "secondary"}
                  className={
                    formData.registrationOpen
                      ? "bg-emerald-500/10 text-emerald-400 border-0"
                      : ""
                  }
                >
                  {formData.registrationOpen ? "Open" : "Closed"}
                </Badge>
              </div>
            </div>

            {/* Free for DAU toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-secondary/20 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="free-dau" className="text-base font-semibold cursor-pointer">
                  Free for DAU Students
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow free registration for @dau.ac.in email addresses
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="free-dau"
                  checked={formData.freeForDau}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, freeForDau: checked })
                  }
                />
                <Badge
                  variant={formData.freeForDau ? "default" : "secondary"}
                  className={
                    formData.freeForDau
                      ? "bg-emerald-500/10 text-emerald-400 border-0"
                      : ""
                  }
                >
                  {formData.freeForDau ? "DAU Free" : "Normal Charges"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/events")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            Create Event
          </Button>
        </div>
      </form>
    </div>
  );
}
