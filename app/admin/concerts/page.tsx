"use client";

import { useState, useEffect } from "react";
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
  Plus,
  Edit,
  Trash2,
  Music,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";

type Concert = {
  id: number;
  concert_name: string;
  concert_date: string;
  venue?: string;
};

export default function ConcertsPage() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    concert_name: "",
    concert_date: "",
    concert_time: "",
    venue: "",
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingConcert, setEditingConcert] = useState<Concert | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchConcerts = async () => {
    try {
      const res = await fetch("/api/admin/concerts");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setConcerts(data || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcerts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.concert_name || !formData.concert_date) {
      alert("Name and date are required");
      return;
    }
    setSubmitting(true);
    try {
      // Combine date and time into timestamp
      let concert_date = formData.concert_date;
      if (formData.concert_time) {
        concert_date = `${formData.concert_date}T${formData.concert_time}:00`;
      }

      const res = await fetch("/api/admin/concerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concert_name: formData.concert_name,
          concert_date,
          venue: formData.venue,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await fetchConcerts();
      setFormData({
        concert_name: "",
        concert_date: "",
        concert_time: "",
        venue: "",
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      alert("Failed to create: " + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (concert: Concert) => {
    // Extract time from concert_date if it exists
    const dateObj = new Date(concert.concert_date);
    const timeString = concert.concert_date.includes("T")
      ? dateObj.toTimeString().slice(0, 5)
      : "";

    setEditingConcert({
      ...concert,
      concert_time: timeString,
    } as Concert & { concert_time: string });
    setIsEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingConcert) return;
    setSubmitting(true);
    try {
      // Combine date and time into timestamp
      const editConcert = editingConcert as Concert & { concert_time?: string };
      let concert_date = editConcert.concert_date?.split("T")[0];

      if (editConcert.concert_time) {
        concert_date = `${concert_date}T${editConcert.concert_time}:00`;
      }

      const res = await fetch("/api/admin/concerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editConcert.id,
          concert_name: editConcert.concert_name,
          concert_date,
          venue: editConcert.venue,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await fetchConcerts();
      setIsEditOpen(false);
      setEditingConcert(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      alert("Failed to update: " + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingId === null) return;
    try {
      const res = await fetch("/api/admin/concerts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await fetchConcerts();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      alert("Failed to delete: " + errorMessage);
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
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
        <Button
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchConcerts();
          }}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <AdminPageHeader
        title="Concerts"
        subtitle="Management"
        badge={
          <Badge className="bg-primary/10 text-primary border-0">
            {concerts.length} concerts
          </Badge>
        }
      />

      {/* Add Concert Form */}
      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Add New Concert</CardTitle>
              <CardDescription>
                Create a new concert for Synapse
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Concert Name *</label>
              <Input
                value={formData.concert_name}
                onChange={(e) =>
                  setFormData({ ...formData, concert_name: e.target.value })
                }
                placeholder="e.g., Main Stage Night"
                required
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date *</label>
              <Input
                type="date"
                value={formData.concert_date}
                onChange={(e) =>
                  setFormData({ ...formData, concert_date: e.target.value })
                }
                required
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Input
                type="time"
                value={formData.concert_time}
                onChange={(e) =>
                  setFormData({ ...formData, concert_time: e.target.value })
                }
                placeholder="Select time"
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
                placeholder="e.g., Main Stage"
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-primary/90"
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add Concert
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Concerts Table */}
      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Music className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>All Concerts</CardTitle>
              <CardDescription>Manage concert schedules</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-muted/50">
                <TableHead className="text-muted-foreground">Concert</TableHead>
                <TableHead className="text-muted-foreground">
                  Date & Time
                </TableHead>
                <TableHead className="text-muted-foreground">Venue</TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {concerts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No concerts created yet.
                  </TableCell>
                </TableRow>
              ) : (
                concerts.map((concert) => (
                  <TableRow
                    key={concert.id}
                    className="border-border/50 hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Music className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">
                          {concert.concert_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant="secondary"
                          className="bg-muted/50 border-border/50 w-fit"
                        >
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(concert.concert_date).toLocaleDateString()}
                        </Badge>
                        {concert.concert_date.includes("T") && (
                          <span className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Clock className="h-3 w-3" />
                            {new Date(concert.concert_date).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {concert.venue && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {concert.venue}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(concert)}
                          className="border-border/50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(concert.id)}
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

      {/* Edit Dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditingConcert(null);
        }}
      >
        <DialogContent className="sm:max-w-[500px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Concert</DialogTitle>
            <DialogDescription>Update concert details</DialogDescription>
          </DialogHeader>
          {editingConcert && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Concert Name</label>
                <Input
                  value={editingConcert.concert_name}
                  onChange={(e) =>
                    setEditingConcert({
                      ...editingConcert,
                      concert_name: e.target.value,
                    })
                  }
                  className="bg-muted/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={editingConcert.concert_date?.split("T")[0]}
                  onChange={(e) =>
                    setEditingConcert({
                      ...editingConcert,
                      concert_date: e.target.value,
                    })
                  }
                  className="bg-muted/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={
                    (editingConcert as Concert & { concert_time?: string })
                      .concert_time || ""
                  }
                  onChange={(e) =>
                    setEditingConcert({
                      ...editingConcert,
                      concert_time: e.target.value,
                    } as Concert & { concert_time: string })
                  }
                  placeholder="Select time"
                  className="bg-muted/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Venue</label>
                <Input
                  value={editingConcert.venue || ""}
                  onChange={(e) =>
                    setEditingConcert({
                      ...editingConcert,
                      venue: e.target.value,
                    })
                  }
                  className="bg-muted/50 border-border/50"
                />
              </div>
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
              disabled={submitting}
              className="bg-primary hover:bg-primary/90"
            >
              {submitting ? (
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

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Delete Concert</DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone.
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
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
