"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/ui/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
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
  Hotel,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Accommodation {
  id: number;
  type: string;
  price: number;
  startDate: string;
  endDate: string;
  available: boolean;
  description: string;
}

export default function AccommodationPage() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([
    {
      id: 1,
      type: "Deluxe Package",
      price: 5000,
      startDate: "2025-12-20",
      endDate: "2025-12-24",
      available: true,
      description: "4 days accommodation with meals",
    },
    {
      id: 2,
      type: "Standard Package",
      price: 3000,
      startDate: "2025-12-21",
      endDate: "2025-12-23",
      available: true,
      description: "3 days accommodation",
    },
    {
      id: 3,
      type: "Budget Package",
      price: 1500,
      startDate: "2025-12-22",
      endDate: "2025-12-24",
      available: false,
      description: "2 days basic accommodation",
    },
  ]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleToggleAvailability = (id: number) => {
    setAccommodations(
      accommodations.map((acc) =>
        acc.id === id ? { ...acc, available: !acc.available } : acc
      )
    );
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingId !== null) {
      setAccommodations(accommodations.filter((a) => a.id !== deletingId));
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const availableCount = accommodations.filter(a => a.available).length;
  const totalRevenue = accommodations.reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="space-y-6 pb-8">
      <AdminPageHeader
        title="Accommodation"
        subtitle="Lodging Management"
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/40">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Hotel className="h-5 w-5 text-primary" />
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
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">{availableCount}</p>
            <p className="text-sm text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">{accommodations.length - availableCount}</p>
            <p className="text-sm text-muted-foreground">Unavailable</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Avg Package Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Packages Table */}
      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Hotel className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>All Packages</CardTitle>
              <CardDescription>Manage accommodation options for attendees</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Package</TableHead>
                <TableHead className="text-muted-foreground">Price</TableHead>
                <TableHead className="text-muted-foreground">Dates</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accommodations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <Hotel className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No accommodation packages yet.</p>
                  </TableCell>
                </TableRow>
              ) : (
                accommodations.map((acc) => (
                  <TableRow key={acc.id} className="border-border/40 hover:bg-secondary/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Hotel className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{acc.type}</p>
                          <p className="text-sm text-muted-foreground">{acc.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-lg font-bold">₹{acc.price.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary" className="bg-secondary/50 w-fit">
                          <Calendar className="mr-1 h-3 w-3" />
                          {acc.startDate}
                        </Badge>
                        <Badge variant="secondary" className="bg-secondary/50 w-fit">
                          <Calendar className="mr-1 h-3 w-3" />
                          {acc.endDate}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={acc.available}
                          onCheckedChange={() => handleToggleAvailability(acc.id)}
                        />
                        <Badge
                          className={acc.available
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                          }
                        >
                          {acc.available ? (
                            <><CheckCircle className="mr-1 h-3 w-3" /> Available</>
                          ) : (
                            <><XCircle className="mr-1 h-3 w-3" /> Unavailable</>
                          )}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/accommodation/${acc.id}`}>
                          <Button variant="outline" size="sm" className="border-border/50">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
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

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this accommodation package? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-border/50">
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
