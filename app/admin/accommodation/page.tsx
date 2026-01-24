"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Home,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle,
  Check,
  X,
} from "lucide-react";

type Accommodation = {
  id: number;
  package_name: string;
  price?: number;
  start_date?: string;
  end_date?: string;
  description?: string;
  is_available?: boolean;
  qr_code?: string;
};

export default function AccommodationPage() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchAccommodations = async () => {
    try {
      const res = await fetch("/api/admin/accommodation");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAccommodations(data.packages || []);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch accommodations",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingId === null) return;
    try {
      const res = await fetch(`/api/admin/accommodation/${deletingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await fetchAccommodations();
    } catch (err: unknown) {
      alert(
        "Failed to delete: " +
          (err instanceof Error
            ? err.message
            : "Failed to delete accommodation"),
      );
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
            fetchAccommodations();
          }}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  const totalPrice = accommodations.reduce((sum, a) => sum + (a.price || 0), 0);
  const availableCount = accommodations.filter((a) => a.is_available).length;

  return (
    <div className="space-y-6 pb-8">
      <AdminPageHeader
        title="Accommodation"
        subtitle="Packages Management"
        badge={
          <Badge className="bg-primary/10 text-primary border-0">
            {accommodations.length} packages
          </Badge>
        }
        actions={
          <Link href="/admin/accommodation/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Package
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-border/40">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Home className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">{accommodations.length}</p>
            <p className="text-sm text-muted-foreground">Total Packages</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">{availableCount}</p>
            <p className="text-sm text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">₹{totalPrice.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Value</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>All Packages</CardTitle>
              <CardDescription>Manage accommodation packages</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-muted/50">
                <TableHead className="text-muted-foreground">
                  Package Name
                </TableHead>
                <TableHead className="text-muted-foreground">Price</TableHead>
                <TableHead className="text-muted-foreground">Dates</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accommodations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No packages added yet.
                  </TableCell>
                </TableRow>
              ) : (
                accommodations.map((acc) => (
                  <TableRow
                    key={acc.id}
                    className="border-border/50 hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {acc.package_name}
                    </TableCell>
                    <TableCell>
                      {acc.price ? (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />₹{acc.price}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {acc.start_date && acc.end_date ? (
                        <Badge
                          variant="secondary"
                          className="bg-muted/50 border-border/50"
                        >
                          <Calendar className="mr-1 h-3 w-3" />
                          {acc.start_date?.split("T")[0]} -{" "}
                          {acc.end_date?.split("T")[0]}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          acc.is_available
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30"
                        }
                      >
                        {acc.is_available ? (
                          <>
                            <Check className="mr-1 h-3 w-3" />
                            Available
                          </>
                        ) : (
                          <>
                            <X className="mr-1 h-3 w-3" />
                            Unavailable
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/accommodation/${acc.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border/50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(acc.id)}
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
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
