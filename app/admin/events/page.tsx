"use client";

import { useState, useEffect } from "react";
import {
  useEvents,
  useCategories,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "@/hooks/use-admin-data";
import { Event, EventFee } from "@/lib/admin-api";
import { AdminPageHeader } from "@/components/admin/ui/AdminSidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Switch } from "@/app/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  ExternalLink,
  Tag,
  IndianRupee,
  XCircle,
  Loader2,
  AlertCircle,
  Upload,
} from "lucide-react";

type ParticipationCategory = {
  enabled: boolean;
  fee: number;
  minParticipants: number;
  maxParticipants: number;
  qrUrl: string;
  qrCodeFile?: File;
  isRegistrationOpen: boolean;
};

type ParticipationCategoryWithCustom = ParticipationCategory & {
  name?: string;
};

type LocalEvent = {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  date: string;
  time: string;
  venue: string;
  rulebookLink: string;
  description: string;
  picture: string;
  coordinatorEmail: string;
  registrationOpen: boolean;
  freeForDau: boolean;
  imageFile?: File;
  participationCategories: {
    solo: ParticipationCategory;
    duet: ParticipationCategory;
    group: ParticipationCategory;
    custom: ParticipationCategoryWithCustom[];
  };
};

// Crop image to 4:5 ratio with maximum coverage
const cropImageToMobileViewport = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    img.onload = () => {
      const targetRatio = 4 / 5; // 4:5 aspect ratio
      const imgRatio = img.width / img.height;

      let outputWidth: number;
      let outputHeight: number;
      let sourceX: number;
      let sourceY: number;
      let sourceWidth: number;
      let sourceHeight: number;

      if (imgRatio > targetRatio) {
        // Image is wider - crop width, use full height
        sourceHeight = img.height;
        sourceWidth = img.height * targetRatio;
        sourceX = (img.width - sourceWidth) / 2;
        sourceY = 0;
        // Output dimensions maintain the ratio with maximum coverage
        outputHeight = img.height;
        outputWidth = img.height * targetRatio;
      } else {
        // Image is taller - crop height, use full width
        sourceWidth = img.width;
        sourceHeight = img.width / targetRatio;
        sourceX = 0;
        sourceY = (img.height - sourceHeight) / 2;
        // Output dimensions maintain the ratio with maximum coverage
        outputWidth = img.width;
        outputHeight = img.width / targetRatio;
      }

      // Set canvas to the maximum dimensions that maintain 4:5 ratio
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // Draw cropped image at full resolution
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputWidth,
        outputHeight,
      );

      // Convert canvas to blob then to File
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(croppedFile);
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      }, file.type);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

// Image Preview Component - Shows original image
const ImagePreview = ({ originalUrl }: { originalUrl: string }) => (
  <div className="relative w-full max-w-2xl mx-auto mt-4">
    <div className="relative w-full aspect-video bg-muted/30 rounded-lg overflow-hidden border border-border/50">
      <img
        src={originalUrl}
        alt="Event preview"
        className="w-full h-full object-contain"
      />
    </div>
    <p className="text-xs text-muted-foreground text-center mt-2">
      Image will be cropped to 4:5 ratio when saved
    </p>
  </div>
);

export default function EventsPage() {
  const {
    data: eventsData,
    loading: eventsLoading,
    error: eventsError,
    refetch,
  } = useEvents();
  const { data: categoriesData, loading: categoriesLoading } = useCategories();
  const { createEvent, loading: creating } = useCreateEvent();
  const { updateEvent, loading: updating } = useUpdateEvent();
  const { deleteEvent, loading: deleting } = useDeleteEvent();

  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    date: "",
    time: "",
    venue: "",
    rulebookLink: "",
    description: "",
    picture: "",
    coordinatorEmail: "",
    imageFile: null as File | null,
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LocalEvent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [editImagePreviewUrl, setEditImagePreviewUrl] = useState<string | null>(
    null,
  );
  const [editOriginalImageUrl, setEditOriginalImageUrl] = useState<
    string | null
  >(null);

  // Transform API data to local format
  useEffect(() => {
    if (eventsData?.events) {
      const transformedEvents: LocalEvent[] = eventsData.events.map(
        (event: Event) => {
          const fees = event.event_fee || [];

          const solo = fees.find(
            (f) => f.fee.participation_type.toLowerCase() === "solo",
          );
          const duet = fees.find(
            (f) => f.fee.participation_type.toLowerCase() === "duet",
          );
          const group = fees.find(
            (f) => f.fee.participation_type.toLowerCase() === "group",
          );

          const standardTypes = ["solo", "duet", "group"];
          const customFees = fees.filter(
            (f) =>
              !standardTypes.includes(f.fee.participation_type.toLowerCase()),
          );

          // Extract time from timestamp
          const dateTime = event.event_date.split("T");
          const time = dateTime[1] ? dateTime[1].substring(0, 5) : "";

          return {
            id: event.event_id,
            name: event.event_name,
            categoryId: event.category_id,
            categoryName: event.event_category?.category_name || "",
            date: event.event_date.split("T")[0],
            time: time,
            venue: event.venue || "",
            rulebookLink: event.rulebook || "",
            description: event.description || "",
            picture: event.event_picture || "",
            coordinatorEmail: event.coordinator_email || "",
            registrationOpen: event.is_registration_open,
            freeForDau: event.is_dau_free,
            participationCategories: {
              solo: {
                enabled: !!solo,
                fee: solo?.fee.price || 0,
                minParticipants: solo?.fee.min_members || 1,
                maxParticipants: solo?.fee.max_members || 1,
                qrUrl: solo?.fee.qr_code || "",
                isRegistrationOpen: solo?.is_registration_open !== false,
              },
              duet: {
                enabled: !!duet,
                fee: duet?.fee.price || 0,
                minParticipants: duet?.fee.min_members || 2,
                maxParticipants: duet?.fee.max_members || 2,
                qrUrl: duet?.fee.qr_code || "",
                isRegistrationOpen: duet?.is_registration_open !== false,
              },
              group: {
                enabled: !!group,
                fee: group?.fee.price || 0,
                minParticipants: group?.fee.min_members || 3,
                maxParticipants: group?.fee.max_members || 8,
                qrUrl: group?.fee.qr_code || "",
                isRegistrationOpen: group?.is_registration_open !== false,
              },
              custom: customFees.map((c) => ({
                enabled: true,
                name: c.fee.participation_type,
                fee: c.fee.price,
                minParticipants: c.fee.min_members,
                maxParticipants: c.fee.max_members,
                qrUrl: c.fee.qr_code || "",
                isRegistrationOpen: c.is_registration_open !== false,
              })),
            },
          };
        },
      );
      setEvents(transformedEvents);
    }
  }, [eventsData]);

  // Cleanup preview URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      if (originalImageUrl) {
        URL.revokeObjectURL(originalImageUrl);
      }
      if (editImagePreviewUrl) {
        URL.revokeObjectURL(editImagePreviewUrl);
      }
      if (editOriginalImageUrl) {
        URL.revokeObjectURL(editOriginalImageUrl);
      }
    };
  }, [
    imagePreviewUrl,
    originalImageUrl,
    editImagePreviewUrl,
    editOriginalImageUrl,
  ]);

  // Add passive event listeners to fix touchstart warning
  useEffect(() => {
    const handleTouchStart = () => {
      // Passive listener - no preventDefault needed
    };

    // Add passive event listeners
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  const categories = categoriesData?.categories || [];

  // Create new event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      alert("Please select a category");
      return;
    }

    const result = await createEvent({
      event_name: formData.name,
      category_id: parseInt(formData.categoryId),
      event_date: formData.date,
      event_time: formData.time || undefined,
      description: formData.description || undefined,
      venue: formData.venue || undefined,
      rulebook: formData.rulebookLink || undefined,
      coordinator_email: formData.coordinatorEmail || undefined,
      image: formData.imageFile || undefined,
      is_registration_open: true,
      is_dau_free: false,
      fees: [{ type: "solo", price: 100, min: 1, max: 1 }],
    });

    if (result) {
      alert("Event created successfully");
      setFormData({
        name: "",
        categoryId: "",
        date: "",
        time: "",
        venue: "",
        rulebookLink: "",
        description: "",
        picture: "",
        coordinatorEmail: "",
        imageFile: null,
      });
      setImagePreviewUrl(null); // Clear preview
      setOriginalImageUrl(null); // Clear original
      refetch();
    } else {
      alert("Failed to create event");
    }
  };

  // Toggle registration (flips all fee-level toggles)
  const toggleRegistration = async (event: LocalEvent) => {
    const newRegState = !event.registrationOpen;
    const fees: EventFee[] = [];
    ["solo", "duet", "group"].forEach((type) => {
      const cat =
        event.participationCategories[
          type as keyof typeof event.participationCategories
        ];
      if (!Array.isArray(cat) && cat.enabled) {
        fees.push({
          type,
          price: cat.fee,
          min: cat.minParticipants,
          max: cat.maxParticipants,
          is_registration_open: newRegState,
        });
      }
    });

    // Handle Custom
    event.participationCategories.custom.forEach((customCat) => {
      if (customCat.name) {
        fees.push({
          type: customCat.name,
          price: customCat.fee,
          min: customCat.minParticipants,
          max: customCat.maxParticipants,
          is_registration_open: newRegState,
        });
      }
    });

    const result = await updateEvent(event.id, {
      event_id: event.id,
      event_name: event.name,
      category_name: event.categoryName,
      event_date: event.date,
      event_time: event.time || undefined,
      coordinator_email: event.coordinatorEmail || undefined,
      is_registration_open: newRegState,
      is_dau_free: event.freeForDau,
      venue: event.venue || undefined,
      rulebook: event.rulebookLink || undefined,
      fees,
    });

    if (result) {
      alert("Registration status updated");
      refetch();
    } else {
      alert("Failed to update registration status");
    }
  };

  // Edit event
  const handleEditClick = (event: LocalEvent) => {
    setEditingEvent(event);
    // Set image preview if event has an existing image
    if (event.picture) {
      setEditOriginalImageUrl(event.picture);
    } else {
      setEditOriginalImageUrl(null);
    }
    setIsEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingEvent) return;

    const fees: EventFee[] = [];
    ["solo", "duet", "group"].forEach((type) => {
      const cat =
        editingEvent.participationCategories[
          type as keyof typeof editingEvent.participationCategories
        ];

      // Handle standard types
      if (!Array.isArray(cat) && cat.enabled) {
        fees.push({
          type,
          price: cat.fee,
          min: cat.minParticipants,
          max: cat.maxParticipants,
          is_registration_open: cat.isRegistrationOpen,
        });
      }
    });

    const customQrCodes: Record<string, File> = {};

    // Handle Custom
    editingEvent.participationCategories.custom.forEach((customCat, index) => {
      if (customCat.name) {
        // Assuming check for valid name
        fees.push({
          type: customCat.name,
          price: customCat.fee,
          min: customCat.minParticipants,
          max: customCat.maxParticipants,
          is_registration_open: customCat.isRegistrationOpen,
        });

        // Handle QR Code
        if (customCat.qrCodeFile) {
          // We use the participation type name as key suffix, but names can change or duplicate (though duplicate types are bad)
          // If we use index, backend needs to know which fee maps to which file.
          // Solution: Add a specialized property to the fee object sent to backend?
          // OR: Use strict convention. Backend can map by matching "qr_code_{type}".
          // BUT: The file key must be unique. If valid identifier chars are used.
          // Let's use `qr_code_${customCat.name}`? If name has spaces or non-standard chars it might be tricky.
          // BETTER: Use indices and tell backend. But `fees` is an array.
          // Backend iterates fees. If fee matches convention...

          // Going with `qr_code_custom_${index}` and adding a `fileKey` property to the fee object?
          // `EventFee` in lib is rigid.

          // Let's use the NAME as the key since that's what ties it together.
          // Risk: Names with spaces/weird chars.
          // The API endpoint constructs `qrCodeMap[customFee.type] = ...`.
          // It expects to find the file under a key.
          // In my route.ts plan, I said "look for a fileKey property".
          // But `EventFee` type is strict.

          // Modification: I will use `qr_code_{sanitized_name}`?
          // Or just `qr_code_custom_${index}` and rely on order? No, order is fragile if backend filters arrays.

          // Best approach: Use `qr_code_custom_${index}` and pass this key in the fee object if possible.
          // Since `EventFee` type is local in page.tsx (imported from lib), I can cast it or extend it locally.
          // Let's assume I can send extra props and backend ignores them unless I read them.
          // I will verify route.ts can read extra props from JSON. Yes it can.

          const fileKey = `qr_code_custom_${index}`;
          customQrCodes[fileKey] = customCat.qrCodeFile;
          // We need to attach this key to the fee object so backend knows where to look.
          // But `fees.push` pushes `EventFee` which has specific shape.
          // I will cast it to any or explicitly modify the fee object pushed.
          (fees[fees.length - 1] as any).fileKey = fileKey;
        }
      }
    });

    const result = await updateEvent(editingEvent.id, {
      event_id: editingEvent.id,
      event_name: editingEvent.name,
      category_name: editingEvent.categoryName,
      event_date: editingEvent.date,
      event_time: editingEvent.time || undefined,
      description: editingEvent.description || undefined,
      rulebook: editingEvent.rulebookLink || undefined,
      coordinator_email: editingEvent.coordinatorEmail || undefined,
      venue: editingEvent.venue || undefined,
      image: editingEvent.imageFile || undefined,
      qr_code_solo: editingEvent.participationCategories.solo.qrCodeFile,
      qr_code_duet: editingEvent.participationCategories.duet.qrCodeFile,
      qr_code_group: editingEvent.participationCategories.group.qrCodeFile,
      // Pass the map of custom files
      custom_qr_codes: customQrCodes,
      is_registration_open: editingEvent.registrationOpen,
      is_dau_free: editingEvent.freeForDau,
      fees,
    });

    if (result) {
      alert("Event updated successfully");
      setIsEditOpen(false);
      setEditingEvent(null);
      refetch();
    } else {
      alert("Failed to update event");
    }
  };

  // Delete event
  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingId !== null) {
      const success = await deleteEvent(deletingId);
      if (success) {
        alert("Event deleted successfully");
        refetch();
      } else {
        alert("Failed to delete event");
      }
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technical: "bg-red-500/20 text-red-300 border-red-500/30",
      Cultural: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      Sports: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      Workshop: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      Gaming: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  if (eventsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (eventsError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-muted-foreground">
          Error loading events: {eventsError}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Events"
        subtitle="Management"
        badge={
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
            {events.length} events
          </Badge>
        }
      />

      {/* Add Event Form */}
      <Card className="border-border/50">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-red-600 to-rose-700 text-white">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Add New Event</CardTitle>
              <CardDescription>Create a new event for Synapse</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Synapse 2026"
                required
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              {categories && categories.length > 0 ? (
                <Select
                  value={formData.categoryId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, categoryId: v })
                  }
                >
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.category_id}
                        value={cat.category_id.toString()}
                      >
                        {cat.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value="No categories available"
                  disabled
                  className="bg-muted/50 border-border/50"
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Coordinator Email</label>
              <Input
                type="email"
                value={formData.coordinatorEmail}
                onChange={(e) =>
                  setFormData({ ...formData, coordinatorEmail: e.target.value })
                }
                placeholder="coordinator@example.com"
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Venue</label>
              <Input
                value={formData.venue}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                placeholder="e.g., Main Auditorium"
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    try {
                      // Store original image URL for preview
                      const originalUrl = URL.createObjectURL(file);
                      setOriginalImageUrl(originalUrl);

                      // Crop image to 400x600
                      const croppedFile = await cropImageToMobileViewport(file);
                      setFormData({
                        ...formData,
                        imageFile: croppedFile,
                      });
                      // Create preview URL from cropped image
                      const url = URL.createObjectURL(croppedFile);
                      setImagePreviewUrl(url);
                    } catch (error) {
                      console.error("Error cropping image:", error);
                      alert(
                        "Failed to process image. Please try another image.",
                      );
                    }
                  } else {
                    setFormData({
                      ...formData,
                      imageFile: null,
                    });
                    setImagePreviewUrl(null);
                    setOriginalImageUrl(null);
                  }
                }}
                className="bg-muted/50 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Image will be cropped to 4:5 ratio with maximum coverage
              </p>
            </div>
            {originalImageUrl && (
              <div className="md:col-span-2 lg:col-span-3">
                <ImagePreview originalUrl={originalImageUrl} />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rulebook Link</label>
              <Input
                value={formData.rulebookLink}
                onChange={(e) =>
                  setFormData({ ...formData, rulebookLink: e.target.value })
                }
                placeholder="https://..."
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter event description..."
                rows={4}
                className="w-full px-3 py-2 bg-muted/50 border border-border/50 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end">
              <Button
                type="submit"
                disabled={creating}
                className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white border-0"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card className="border-border/50">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>All Events</CardTitle>
                <CardDescription>
                  Manage event details and registrations
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-muted/50">
                <TableHead className="text-muted-foreground">Event</TableHead>
                <TableHead className="text-muted-foreground">
                  Category
                </TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Fees</TableHead>
                <TableHead className="text-muted-foreground">
                  Registration
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No events created yet. Add your first event above!
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow
                    key={event.id}
                    className="border-border/50 hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/20 text-red-400">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{event.name}</p>
                          {event.rulebookLink && (
                            <a
                              href={event.rulebookLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-red-400 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" /> Rulebook
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getCategoryColor(event.categoryName)}
                      >
                        <Tag className="mr-1 h-3 w-3" />
                        {event.categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-muted/50 border-border/50"
                      >
                        <Calendar className="mr-1 h-3 w-3" />
                        {event.date}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {event.participationCategories.solo.enabled && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-muted/50 border-border/50"
                          >
                            Solo: ₹{event.participationCategories.solo.fee}
                          </Badge>
                        )}
                        {event.participationCategories.duet.enabled && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-muted/50 border-border/50"
                          >
                            Duet: ₹{event.participationCategories.duet.fee}
                          </Badge>
                        )}
                        {event.participationCategories.group.enabled && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-muted/50 border-border/50"
                          >
                            Group: ₹{event.participationCategories.group.fee}
                          </Badge>
                        )}
                        {event.participationCategories.custom.map(
                          (customCat, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs bg-muted/50 border-border/50"
                            >
                              {customCat.name}: ₹{customCat.fee}
                            </Badge>
                          ),
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={event.registrationOpen}
                            onCheckedChange={() => toggleRegistration(event)}
                            disabled={updating}
                          />
                          <span className="text-xs text-muted-foreground">
                            {event.registrationOpen ? "All Open" : "All Closed"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {event.participationCategories.solo.enabled && (
                            <Badge
                              className={`text-[10px] px-1.5 py-0 ${
                                event.participationCategories.solo
                                  .isRegistrationOpen
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : "bg-red-500/20 text-red-300 border-red-500/30"
                              }`}
                            >
                              Solo:{" "}
                              {event.participationCategories.solo
                                .isRegistrationOpen
                                ? "Open"
                                : "Closed"}
                            </Badge>
                          )}
                          {event.participationCategories.duet.enabled && (
                            <Badge
                              className={`text-[10px] px-1.5 py-0 ${
                                event.participationCategories.duet
                                  .isRegistrationOpen
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : "bg-red-500/20 text-red-300 border-red-500/30"
                              }`}
                            >
                              Duet:{" "}
                              {event.participationCategories.duet
                                .isRegistrationOpen
                                ? "Open"
                                : "Closed"}
                            </Badge>
                          )}
                          {event.participationCategories.group.enabled && (
                            <Badge
                              className={`text-[10px] px-1.5 py-0 ${
                                event.participationCategories.group
                                  .isRegistrationOpen
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : "bg-red-500/20 text-red-300 border-red-500/30"
                              }`}
                            >
                              Group:{" "}
                              {event.participationCategories.group
                                .isRegistrationOpen
                                ? "Open"
                                : "Closed"}
                            </Badge>
                          )}
                          {event.participationCategories.custom.map(
                            (customCat, idx) => (
                              <Badge
                                key={idx}
                                className={`text-[10px] px-1.5 py-0 ${
                                  customCat.isRegistrationOpen
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                    : "bg-red-500/20 text-red-300 border-red-500/30"
                                }`}
                              >
                                {customCat.name}:{" "}
                                {customCat.isRegistrationOpen
                                  ? "Open"
                                  : "Closed"}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(event)}
                          className="border-border/50 hover:bg-muted/50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(event.id)}
                          disabled={deleting}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setEditingEvent(null);
            setEditImagePreviewUrl(null);
            setEditOriginalImageUrl(null);
          }
        }}
        modal={true}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-card border-border !grid-rows-[auto_1fr_auto] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update event details and participation settings
            </DialogDescription>
          </DialogHeader>
          {editingEvent && (
            <div
              className="overflow-y-scroll pr-2 min-h-0"
              style={{
                maxHeight: "calc(90vh - 180px)",
                scrollbarWidth: "thin",
                scrollbarColor: "#ef4444 #1a1a1a",
              }}
            >
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 sticky top-0 z-10">
                  <TabsTrigger value="details">Event Details</TabsTrigger>
                  <TabsTrigger value="fees">Participation & Fees</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Event Name</label>
                      <Input
                        value={editingEvent.name}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            name: e.target.value,
                          })
                        }
                        className="bg-muted/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        value={editingEvent.categoryId.toString()}
                        onValueChange={(v) =>
                          setEditingEvent({
                            ...editingEvent,
                            categoryId: parseInt(v),
                            categoryName:
                              categories.find(
                                (c) => c.category_id === parseInt(v),
                              )?.category_name || "",
                          })
                        }
                      >
                        <SelectTrigger className="bg-muted/50 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {categories.map((cat) => (
                            <SelectItem
                              key={cat.category_id}
                              value={cat.category_id.toString()}
                            >
                              {cat.category_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        type="date"
                        value={editingEvent.date}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            date: e.target.value,
                          })
                        }
                        className="bg-muted/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">Time</label>
                      <Input
                        type="time"
                        value={editingEvent.time}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            time: e.target.value,
                          })
                        }
                        className="bg-muted/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">
                        Coordinator Email
                      </label>
                      <Input
                        type="email"
                        value={editingEvent.coordinatorEmail}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            coordinatorEmail: e.target.value,
                          })
                        }
                        placeholder="coordinator@example.com"
                        className="bg-muted/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">Venue</label>
                      <Input
                        value={editingEvent.venue}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            venue: e.target.value,
                          })
                        }
                        placeholder="e.g., Main Auditorium"
                        className="bg-muted/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">Event Image</label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              // Store original image URL for preview
                              const originalUrl = URL.createObjectURL(file);
                              setEditOriginalImageUrl(originalUrl);

                              // Crop image to 400x600
                              const croppedFile =
                                await cropImageToMobileViewport(file);
                              setEditingEvent({
                                ...editingEvent,
                                imageFile: croppedFile,
                              });
                              // Create preview URL from cropped image
                              const url = URL.createObjectURL(croppedFile);
                              setEditImagePreviewUrl(url);
                            } catch (error) {
                              console.error("Error cropping image:", error);
                              alert(
                                "Failed to process image. Please try another image.",
                              );
                            }
                          } else {
                            setEditingEvent({
                              ...editingEvent,
                              imageFile: undefined,
                            });
                            setEditImagePreviewUrl(null);
                            setEditOriginalImageUrl(null);
                          }
                        }}
                        className="bg-muted/50 border-border/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Image will be cropped to 4:5 ratio with maximum coverage
                      </p>
                      {editingEvent.picture && !editingEvent.imageFile && (
                        <p className="text-xs text-muted-foreground">
                          Current image: {editingEvent.picture.split("/").pop()}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">
                        Rulebook Link
                      </label>
                      <Input
                        value={editingEvent.rulebookLink}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            rulebookLink: e.target.value,
                          })
                        }
                        placeholder="https://..."
                        className="bg-muted/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        value={editingEvent.description}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter event description..."
                        rows={4}
                        className="w-full px-3 py-2 bg-muted/50 border border-border/50 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  {/* Image Preview - shown for both new uploads and existing images */}
                  {(editOriginalImageUrl ||
                    (editingEvent.picture && !editingEvent.imageFile)) && (
                    <div className="w-full">
                      <ImagePreview
                        originalUrl={
                          editOriginalImageUrl || editingEvent.picture
                        }
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
                    <div>
                      <p className="font-medium">Free for DAU Students</p>
                      <p className="text-sm text-muted-foreground">
                        When enabled, DAU students can register for free
                      </p>
                    </div>
                    <Switch
                      checked={editingEvent.freeForDau}
                      onCheckedChange={(v) =>
                        setEditingEvent({ ...editingEvent, freeForDau: v })
                      }
                    />
                  </div>
                </TabsContent>
                <TabsContent value="fees" className="space-y-4 mt-4">
                  {/* Solo */}
                  <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-red-400" />
                        <span className="font-medium">Solo Participation</span>
                      </div>
                      {editingEvent.participationCategories.solo.enabled ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                          onClick={() =>
                            setEditingEvent({
                              ...editingEvent,
                              participationCategories: {
                                ...editingEvent.participationCategories,
                                solo: {
                                  ...editingEvent.participationCategories.solo,
                                  enabled: false,
                                },
                              },
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs hover:bg-green-500/10 hover:text-green-500"
                          onClick={() =>
                            setEditingEvent({
                              ...editingEvent,
                              participationCategories: {
                                ...editingEvent.participationCategories,
                                solo: {
                                  ...editingEvent.participationCategories.solo,
                                  enabled: true,
                                },
                              },
                            })
                          }
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add
                        </Button>
                      )}
                    </div>
                    {editingEvent.participationCategories.solo.enabled && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            value={
                              editingEvent.participationCategories.solo.fee
                            }
                            onChange={(e) =>
                              setEditingEvent({
                                ...editingEvent,
                                participationCategories: {
                                  ...editingEvent.participationCategories,
                                  solo: {
                                    ...editingEvent.participationCategories
                                      .solo,
                                    fee: parseInt(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                            className="w-32 bg-muted/50 border-border/50"
                          />
                          <span className="text-sm text-muted-foreground">
                            per person
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setEditingEvent({
                                  ...editingEvent,
                                  participationCategories: {
                                    ...editingEvent.participationCategories,
                                    solo: {
                                      ...editingEvent.participationCategories
                                        .solo,
                                      qrCodeFile: file || undefined,
                                    },
                                  },
                                });
                              }}
                              className="flex-1 bg-muted/50 border-border/50"
                            />
                          </div>
                          {editingEvent.participationCategories.solo.fee > 0 &&
                            (editingEvent.participationCategories.solo
                              .qrCodeFile ||
                              editingEvent.participationCategories.solo
                                .qrUrl) && (
                              <div className="mt-3">
                                {editingEvent.participationCategories.solo
                                  .qrCodeFile ? (
                                  <>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      New QR Code:{" "}
                                      {
                                        editingEvent.participationCategories
                                          .solo.qrCodeFile.name
                                      }
                                    </p>
                                    <div className="relative w-48 h-48 border border-border/50 rounded-lg overflow-hidden bg-muted/30">
                                      <img
                                        src={URL.createObjectURL(
                                          editingEvent.participationCategories
                                            .solo.qrCodeFile,
                                        )}
                                        alt="Solo QR Code Preview"
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      Current QR Code
                                    </p>
                                    <div className="relative w-48 h-48 border border-border/50 rounded-lg overflow-hidden bg-muted/30">
                                      <img
                                        src={
                                          editingEvent.participationCategories
                                            .solo.qrUrl
                                        }
                                        alt="Solo QR Code"
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/30">
                          <span className="text-sm text-muted-foreground">
                            Registration Open
                          </span>
                          <Switch
                            checked={
                              editingEvent.participationCategories.solo
                                .isRegistrationOpen
                            }
                            onCheckedChange={(v) =>
                              setEditingEvent({
                                ...editingEvent,
                                participationCategories: {
                                  ...editingEvent.participationCategories,
                                  solo: {
                                    ...editingEvent.participationCategories
                                      .solo,
                                    isRegistrationOpen: v,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Duet */}
                  <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-rose-400" />
                        <span className="font-medium">Duet Participation</span>
                      </div>
                      {editingEvent.participationCategories.duet.enabled ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                          onClick={() =>
                            setEditingEvent({
                              ...editingEvent,
                              participationCategories: {
                                ...editingEvent.participationCategories,
                                duet: {
                                  ...editingEvent.participationCategories.duet,
                                  enabled: false,
                                },
                              },
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs hover:bg-green-500/10 hover:text-green-500"
                          onClick={() =>
                            setEditingEvent({
                              ...editingEvent,
                              participationCategories: {
                                ...editingEvent.participationCategories,
                                duet: {
                                  ...editingEvent.participationCategories.duet,
                                  enabled: true,
                                },
                              },
                            })
                          }
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add
                        </Button>
                      )}
                    </div>
                    {editingEvent.participationCategories.duet.enabled && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            value={
                              editingEvent.participationCategories.duet.fee
                            }
                            onChange={(e) =>
                              setEditingEvent({
                                ...editingEvent,
                                participationCategories: {
                                  ...editingEvent.participationCategories,
                                  duet: {
                                    ...editingEvent.participationCategories
                                      .duet,
                                    fee: parseInt(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                            className="w-32 bg-muted/50 border-border/50"
                          />
                          <span className="text-sm text-muted-foreground">
                            per team
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setEditingEvent({
                                  ...editingEvent,
                                  participationCategories: {
                                    ...editingEvent.participationCategories,
                                    duet: {
                                      ...editingEvent.participationCategories
                                        .duet,
                                      qrCodeFile: file || undefined,
                                    },
                                  },
                                });
                              }}
                              className="flex-1 bg-muted/50 border-border/50"
                            />
                          </div>
                          {editingEvent.participationCategories.duet.fee > 0 &&
                            (editingEvent.participationCategories.duet
                              .qrCodeFile ||
                              editingEvent.participationCategories.duet
                                .qrUrl) && (
                              <div className="mt-3">
                                {editingEvent.participationCategories.duet
                                  .qrCodeFile ? (
                                  <>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      New QR Code:{" "}
                                      {
                                        editingEvent.participationCategories
                                          .duet.qrCodeFile.name
                                      }
                                    </p>
                                    <div className="relative w-48 h-48 border border-border/50 rounded-lg overflow-hidden bg-muted/30">
                                      <img
                                        src={URL.createObjectURL(
                                          editingEvent.participationCategories
                                            .duet.qrCodeFile,
                                        )}
                                        alt="Duet QR Code Preview"
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      Current QR Code
                                    </p>
                                    <div className="relative w-48 h-48 border border-border/50 rounded-lg overflow-hidden bg-muted/30">
                                      <img
                                        src={
                                          editingEvent.participationCategories
                                            .duet.qrUrl
                                        }
                                        alt="Duet QR Code"
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/30">
                          <span className="text-sm text-muted-foreground">
                            Registration Open
                          </span>
                          <Switch
                            checked={
                              editingEvent.participationCategories.duet
                                .isRegistrationOpen
                            }
                            onCheckedChange={(v) =>
                              setEditingEvent({
                                ...editingEvent,
                                participationCategories: {
                                  ...editingEvent.participationCategories,
                                  duet: {
                                    ...editingEvent.participationCategories
                                      .duet,
                                    isRegistrationOpen: v,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Group */}
                  <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-red-400" />
                        <span className="font-medium">Group Participation</span>
                      </div>
                      {editingEvent.participationCategories.group.enabled ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                          onClick={() =>
                            setEditingEvent({
                              ...editingEvent,
                              participationCategories: {
                                ...editingEvent.participationCategories,
                                group: {
                                  ...editingEvent.participationCategories.group,
                                  enabled: false,
                                },
                              },
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs hover:bg-green-500/10 hover:text-green-500"
                          onClick={() =>
                            setEditingEvent({
                              ...editingEvent,
                              participationCategories: {
                                ...editingEvent.participationCategories,
                                group: {
                                  ...editingEvent.participationCategories.group,
                                  enabled: true,
                                },
                              },
                            })
                          }
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add
                        </Button>
                      )}
                    </div>
                    {editingEvent.participationCategories.group.enabled && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            value={
                              editingEvent.participationCategories.group.fee
                            }
                            onChange={(e) =>
                              setEditingEvent({
                                ...editingEvent,
                                participationCategories: {
                                  ...editingEvent.participationCategories,
                                  group: {
                                    ...editingEvent.participationCategories
                                      .group,
                                    fee: parseInt(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                            className="w-32 bg-muted/50 border-border/50"
                          />
                          <span className="text-sm text-muted-foreground">
                            per team
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Min:</span>
                            <Input
                              type="number"
                              value={
                                editingEvent.participationCategories.group
                                  .minParticipants
                              }
                              onChange={(e) =>
                                setEditingEvent({
                                  ...editingEvent,
                                  participationCategories: {
                                    ...editingEvent.participationCategories,
                                    group: {
                                      ...editingEvent.participationCategories
                                        .group,
                                      minParticipants:
                                        parseInt(e.target.value) || 3,
                                    },
                                  },
                                })
                              }
                              className="w-20 bg-muted/50 border-border/50"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Max:</span>
                            <Input
                              type="number"
                              value={
                                editingEvent.participationCategories.group
                                  .maxParticipants
                              }
                              onChange={(e) =>
                                setEditingEvent({
                                  ...editingEvent,
                                  participationCategories: {
                                    ...editingEvent.participationCategories,
                                    group: {
                                      ...editingEvent.participationCategories
                                        .group,
                                      maxParticipants:
                                        parseInt(e.target.value) || 8,
                                    },
                                  },
                                })
                              }
                              className="w-20 bg-muted/50 border-border/50"
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            members
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setEditingEvent({
                                  ...editingEvent,
                                  participationCategories: {
                                    ...editingEvent.participationCategories,
                                    group: {
                                      ...editingEvent.participationCategories
                                        .group,
                                      qrCodeFile: file || undefined,
                                    },
                                  },
                                });
                              }}
                              className="flex-1 bg-muted/50 border-border/50"
                            />
                          </div>
                          {editingEvent.participationCategories.group.fee > 0 &&
                            (editingEvent.participationCategories.group
                              .qrCodeFile ||
                              editingEvent.participationCategories.group
                                .qrUrl) && (
                              <div className="mt-3">
                                {editingEvent.participationCategories.group
                                  .qrCodeFile ? (
                                  <>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      New QR Code:{" "}
                                      {
                                        editingEvent.participationCategories
                                          .group.qrCodeFile.name
                                      }
                                    </p>
                                    <div className="relative w-48 h-48 border border-border/50 rounded-lg overflow-hidden bg-muted/30">
                                      <img
                                        src={URL.createObjectURL(
                                          editingEvent.participationCategories
                                            .group.qrCodeFile,
                                        )}
                                        alt="Group QR Code Preview"
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      Current QR Code
                                    </p>
                                    <div className="relative w-48 h-48 border border-border/50 rounded-lg overflow-hidden bg-muted/30">
                                      <img
                                        src={
                                          editingEvent.participationCategories
                                            .group.qrUrl
                                        }
                                        alt="Group QR Code"
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/30">
                          <span className="text-sm text-muted-foreground">
                            Registration Open
                          </span>
                          <Switch
                            checked={
                              editingEvent.participationCategories.group
                                .isRegistrationOpen
                            }
                            onCheckedChange={(v) =>
                              setEditingEvent({
                                ...editingEvent,
                                participationCategories: {
                                  ...editingEvent.participationCategories,
                                  group: {
                                    ...editingEvent.participationCategories
                                      .group,
                                    isRegistrationOpen: v,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Custom Participation */}
                  <div className="p-4 rounded-lg border border-border/50 bg-muted/30 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-amber-400" />
                        <span className="font-medium">
                          Custom Participation
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newCustom = [
                            ...editingEvent.participationCategories.custom,
                            {
                              enabled: true,
                              name: "",
                              fee: 0,
                              minParticipants: 1,
                              maxParticipants: 1,
                              qrUrl: "",
                              isRegistrationOpen: true,
                            },
                          ];
                          setEditingEvent({
                            ...editingEvent,
                            participationCategories: {
                              ...editingEvent.participationCategories,
                              custom: newCustom,
                            },
                          });
                        }}
                        className="h-8 text-xs hover:bg-amber-500/10 hover:text-amber-500"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add Type
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {editingEvent.participationCategories.custom.map(
                        (customCat, index) => (
                          <div
                            key={index}
                            className="p-3 bg-background/50 rounded-md border border-border/50 relative group"
                          >
                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-red-500"
                                onClick={() => {
                                  const newCustom = [
                                    ...editingEvent.participationCategories
                                      .custom,
                                  ];
                                  newCustom.splice(index, 1);
                                  setEditingEvent({
                                    ...editingEvent,
                                    participationCategories: {
                                      ...editingEvent.participationCategories,
                                      custom: newCustom,
                                    },
                                  });
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="space-y-3">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Participation Details
                                </label>
                                <Input
                                  placeholder="Participation Name (e.g. VIP, Spectator)"
                                  value={customCat.name}
                                  onChange={(e) => {
                                    const newCustom = [
                                      ...editingEvent.participationCategories
                                        .custom,
                                    ];
                                    newCustom[index] = {
                                      ...newCustom[index],
                                      name: e.target.value,
                                    };
                                    setEditingEvent({
                                      ...editingEvent,
                                      participationCategories: {
                                        ...editingEvent.participationCategories,
                                        custom: newCustom,
                                      },
                                    });
                                  }}
                                  className="bg-muted/50 border-border/50"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  value={customCat.fee}
                                  onChange={(e) => {
                                    const newCustom = [
                                      ...editingEvent.participationCategories
                                        .custom,
                                    ];
                                    newCustom[index] = {
                                      ...newCustom[index],
                                      fee: parseInt(e.target.value) || 0,
                                    };
                                    setEditingEvent({
                                      ...editingEvent,
                                      participationCategories: {
                                        ...editingEvent.participationCategories,
                                        custom: newCustom,
                                      },
                                    });
                                  }}
                                  className="w-32 bg-muted/50 border-border/50"
                                />
                                <span className="text-sm text-muted-foreground">
                                  per team
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">Min:</span>
                                  <Input
                                    type="number"
                                    value={customCat.minParticipants}
                                    onChange={(e) => {
                                      const newCustom = [
                                        ...editingEvent.participationCategories
                                          .custom,
                                      ];
                                      newCustom[index] = {
                                        ...newCustom[index],
                                        minParticipants:
                                          parseInt(e.target.value) || 1,
                                      };
                                      setEditingEvent({
                                        ...editingEvent,
                                        participationCategories: {
                                          ...editingEvent.participationCategories,
                                          custom: newCustom,
                                        },
                                      });
                                    }}
                                    className="w-20 bg-muted/50 border-border/50"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">Max:</span>
                                  <Input
                                    type="number"
                                    value={customCat.maxParticipants}
                                    onChange={(e) => {
                                      const newCustom = [
                                        ...editingEvent.participationCategories
                                          .custom,
                                      ];
                                      newCustom[index] = {
                                        ...newCustom[index],
                                        maxParticipants:
                                          parseInt(e.target.value) || 1,
                                      };
                                      setEditingEvent({
                                        ...editingEvent,
                                        participationCategories: {
                                          ...editingEvent.participationCategories,
                                          custom: newCustom,
                                        },
                                      });
                                    }}
                                    className="w-20 bg-muted/50 border-border/50"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Upload className="h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0] || null;
                                      const newCustom = [
                                        ...editingEvent.participationCategories
                                          .custom,
                                      ];
                                      newCustom[index] = {
                                        ...newCustom[index],
                                        qrCodeFile: file || undefined,
                                      };
                                      setEditingEvent({
                                        ...editingEvent,
                                        participationCategories: {
                                          ...editingEvent.participationCategories,
                                          custom: newCustom,
                                        },
                                      });
                                    }}
                                    className="flex-1 bg-muted/50 border-border/50"
                                  />
                                </div>
                                {customCat.fee > 0 &&
                                  (customCat.qrCodeFile || customCat.qrUrl) && (
                                    <div className="mt-3">
                                      {customCat.qrCodeFile ? (
                                        <>
                                          <p className="text-xs text-muted-foreground mb-2">
                                            New QR Code:{" "}
                                            {customCat.qrCodeFile.name}
                                          </p>
                                          <div className="relative w-48 h-48 border border-border/50 rounded-lg overflow-hidden bg-muted/30">
                                            <img
                                              src={URL.createObjectURL(
                                                customCat.qrCodeFile,
                                              )}
                                              alt="Custom QR Code Preview"
                                              className="w-full h-full object-contain"
                                            />
                                          </div>
                                        </>
                                      ) : (
                                        customCat.qrUrl && (
                                          <>
                                            <p className="text-xs text-muted-foreground mb-2">
                                              Current QR Code
                                            </p>
                                            <div className="relative w-48 h-48 border border-border/50 rounded-lg overflow-hidden bg-muted/30">
                                              <img
                                                src={customCat.qrUrl}
                                                alt="Custom QR Code"
                                                className="w-full h-full object-contain"
                                              />
                                            </div>
                                          </>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                              <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/30">
                                <span className="text-sm text-muted-foreground">
                                  Registration Open
                                </span>
                                <Switch
                                  checked={customCat.isRegistrationOpen}
                                  onCheckedChange={(v) => {
                                    const newCustom = [
                                      ...editingEvent.participationCategories
                                        .custom,
                                    ];
                                    newCustom[index] = {
                                      ...newCustom[index],
                                      isRegistrationOpen: v,
                                    };
                                    setEditingEvent({
                                      ...editingEvent,
                                      participationCategories: {
                                        ...editingEvent.participationCategories,
                                        custom: newCustom,
                                      },
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                      {editingEvent.participationCategories.custom.length ===
                        0 && (
                        <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border/50 rounded-md">
                          No custom participation types added.
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={updating}
              className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white border-0"
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
