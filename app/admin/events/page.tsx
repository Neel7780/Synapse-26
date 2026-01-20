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
  MapPin,
  Clock,
  Users,
  ExternalLink,
  Tag,
  DollarSign,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Upload,
  QrCode,
} from "lucide-react";

type ParticipationCategory = {
  enabled: boolean;
  fee: number;
  minParticipants: number;
  maxParticipants: number;
  qrUrl: string;
  qrCodeFile?: File;
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
  };
};

// Crop image to 2:3 ratio (400x600) with maximum coverage
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
      const targetRatio = 400 / 600; // 2:3 aspect ratio
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

      // Set canvas to the maximum dimensions that maintain 2:3 ratio
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

// Image Preview Component - Shows original with crop overlay
const ImagePreview = ({
  originalUrl,
  croppedUrl,
}: {
  originalUrl: string;
  croppedUrl?: string;
}) => (
  <div className="relative w-full max-w-2xl mx-auto mt-4">
    <div className="relative w-full aspect-video bg-muted/30 rounded-lg overflow-hidden border border-border/50">
      <img
        src={originalUrl}
        alt="Event preview"
        className="w-full h-full object-contain"
      />
      {/* Gray overlay with 400x600 cutout showing what will be saved */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top overlay */}
        <div
          className="absolute top-0 left-0 right-0 bg-gray-900/60"
          style={{ height: "calc((100% - min(100%, 100vh * 0.6)) / 2)" }}
        />
        {/* Bottom overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gray-900/60"
          style={{ height: "calc((100% - min(100%, 100vh * 0.6)) / 2)" }}
        />
        {/* Left overlay */}
        <div
          className="absolute left-0 bg-gray-900/60"
          style={{
            top: "calc((100% - min(100%, 100vh * 0.6)) / 2)",
            height: "min(100%, 100vh * 0.6)",
            width: "calc((100% - min(100% * 0.4, 100vh * 0.4)) / 2)",
          }}
        />
        {/* Right overlay */}
        <div
          className="absolute right-0 bg-gray-900/60"
          style={{
            top: "calc((100% - min(100%, 100vh * 0.6)) / 2)",
            height: "min(100%, 100vh * 0.6)",
            width: "calc((100% - min(100% * 0.4, 100vh * 0.4)) / 2)",
          }}
        />
        {/* Label for crop area */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "400px",
            height: "600px",
            maxWidth: "90%",
            maxHeight: "90%",
          }}
        >
          <div className="absolute -top-7 left-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded font-medium">
            ✓ This area will be saved (400x600)
          </div>
        </div>
      </div>
    </div>
    <p className="text-xs text-muted-foreground text-center mt-2">
      Full image shown • Clear area indicates saved portion • Gray overlay shows
      cropped areas
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
            venue: event.description || "",
            rulebookLink: event.rulebook || "",
            description: event.description || "",
            picture: event.event_picture || "",
            coordinatorEmail: "",
            registrationOpen: event.is_registration_open,
            freeForDau: event.is_dau_free,
            participationCategories: {
              solo: {
                enabled: !!solo,
                fee: solo?.fee.price || 0,
                minParticipants: solo?.fee.min_members || 1,
                maxParticipants: solo?.fee.max_members || 1,
                qrUrl: (solo as any)?.payment_qr_url || "",
              },
              duet: {
                enabled: !!duet,
                fee: duet?.fee.price || 0,
                minParticipants: duet?.fee.min_members || 2,
                maxParticipants: duet?.fee.max_members || 2,
                qrUrl: (duet as any)?.payment_qr_url || "",
              },
              group: {
                enabled: !!group,
                fee: group?.fee.price || 0,
                minParticipants: group?.fee.min_members || 3,
                maxParticipants: group?.fee.max_members || 8,
                qrUrl: (group as any)?.payment_qr_url || "",
              },
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

  // Toggle registration
  const toggleRegistration = async (event: LocalEvent) => {
    const fees: EventFee[] = [];
    ["solo", "duet", "group"].forEach((type) => {
      const cat =
        event.participationCategories[
          type as keyof typeof event.participationCategories
        ];
      if (cat.enabled) {
        fees.push({
          type,
          price: cat.fee,
          min: cat.minParticipants,
          max: cat.maxParticipants,
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
      is_registration_open: !event.registrationOpen,
      is_dau_free: event.freeForDau,
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
      if (cat.enabled) {
        fees.push({
          type,
          price: cat.fee,
          min: cat.minParticipants,
          max: cat.maxParticipants,
        });
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
      image: editingEvent.imageFile || undefined,
      qr_code_solo: editingEvent.participationCategories.solo.qrCodeFile,
      qr_code_duet: editingEvent.participationCategories.duet.qrCodeFile,
      qr_code_group: editingEvent.participationCategories.group.qrCodeFile,
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
                Image will be cropped to 2:3 ratio (400x600) with maximum
                coverage
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
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={event.registrationOpen}
                          onCheckedChange={() => toggleRegistration(event)}
                          disabled={updating}
                        />
                        <Badge
                          className={
                            event.registrationOpen
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-red-500/20 text-red-300 border-red-500/30"
                          }
                        >
                          {event.registrationOpen ? (
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {event.registrationOpen ? "Open" : "Closed"}
                        </Badge>
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

      {/* Edit Event Dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditingEvent(null);
        }}
        modal={true}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-card border-border flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update event details and participation settings
            </DialogDescription>
          </DialogHeader>
          {editingEvent && (
            <Tabs
              defaultValue="details"
              className="w-full flex-1 flex flex-col min-h-0"
            >
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 flex-shrink-0">
                <TabsTrigger value="details">Event Details</TabsTrigger>
                <TabsTrigger value="fees">Participation & Fees</TabsTrigger>
              </TabsList>
              <TabsContent
                value="details"
                className="space-y-4 mt-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/50 [&::-webkit-scrollbar-thumb]:bg-red-500/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-red-500/70"
              >
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
                      Image will be cropped to 2:3 ratio (400x600) with maximum
                      coverage
                    </p>
                    {editingEvent.picture && !editingEvent.imageFile && (
                      <p className="text-xs text-muted-foreground">
                        Current image: {editingEvent.picture.split("/").pop()}
                      </p>
                    )}
                  </div>
                </div>
                {/* Image Preview - shown for both new uploads and existing images */}
                {(editOriginalImageUrl ||
                  (editingEvent.picture && !editingEvent.imageFile)) && (
                  <div className="w-full">
                    <ImagePreview
                      originalUrl={editOriginalImageUrl || editingEvent.picture}
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
              <TabsContent
                value="fees"
                className="space-y-4 mt-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/50 [&::-webkit-scrollbar-thumb]:bg-red-500/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-red-500/70"
              >
                {/* Solo */}
                <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-red-400" />
                      <span className="font-medium">Solo Participation</span>
                    </div>
                    <Switch
                      checked={
                        editingEvent.participationCategories.solo.enabled
                      }
                      onCheckedChange={(v) =>
                        setEditingEvent({
                          ...editingEvent,
                          participationCategories: {
                            ...editingEvent.participationCategories,
                            solo: {
                              ...editingEvent.participationCategories.solo,
                              enabled: v,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  {editingEvent.participationCategories.solo.enabled && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={editingEvent.participationCategories.solo.fee}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              participationCategories: {
                                ...editingEvent.participationCategories,
                                solo: {
                                  ...editingEvent.participationCategories.solo,
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
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          value={
                            editingEvent.participationCategories.solo.qrUrl
                          }
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              participationCategories: {
                                ...editingEvent.participationCategories,
                                solo: {
                                  ...editingEvent.participationCategories.solo,
                                  qrUrl: e.target.value,
                                },
                              },
                            })
                          }
                          placeholder="Payment QR Code URL"
                          className="flex-1 bg-muted/50 border-border/50"
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
                    <Switch
                      checked={
                        editingEvent.participationCategories.duet.enabled
                      }
                      onCheckedChange={(v) =>
                        setEditingEvent({
                          ...editingEvent,
                          participationCategories: {
                            ...editingEvent.participationCategories,
                            duet: {
                              ...editingEvent.participationCategories.duet,
                              enabled: v,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  {editingEvent.participationCategories.duet.enabled && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={editingEvent.participationCategories.duet.fee}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              participationCategories: {
                                ...editingEvent.participationCategories,
                                duet: {
                                  ...editingEvent.participationCategories.duet,
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
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          value={
                            editingEvent.participationCategories.duet.qrUrl
                          }
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              participationCategories: {
                                ...editingEvent.participationCategories,
                                duet: {
                                  ...editingEvent.participationCategories.duet,
                                  qrUrl: e.target.value,
                                },
                              },
                            })
                          }
                          placeholder="Payment QR Code URL"
                          className="flex-1 bg-muted/50 border-border/50"
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
                    <Switch
                      checked={
                        editingEvent.participationCategories.group.enabled
                      }
                      onCheckedChange={(v) =>
                        setEditingEvent({
                          ...editingEvent,
                          participationCategories: {
                            ...editingEvent.participationCategories,
                            group: {
                              ...editingEvent.participationCategories.group,
                              enabled: v,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  {editingEvent.participationCategories.group.enabled && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={editingEvent.participationCategories.group.fee}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              participationCategories: {
                                ...editingEvent.participationCategories,
                                group: {
                                  ...editingEvent.participationCategories.group,
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
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          value={
                            editingEvent.participationCategories.group.qrUrl
                          }
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              participationCategories: {
                                ...editingEvent.participationCategories,
                                group: {
                                  ...editingEvent.participationCategories.group,
                                  qrUrl: e.target.value,
                                },
                              },
                            })
                          }
                          placeholder="Payment QR Code URL"
                          className="flex-1 bg-muted/50 border-border/50"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter className="flex-shrink-0">
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
