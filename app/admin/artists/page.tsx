"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/ui/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
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
  Trash2,
  Music,
  Calendar,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";

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

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchArtists = async () => {
    try {
      const res = await fetch("/api/admin/artists");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setArtists(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch artists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingId === null) return;
    try {
      const res = await fetch("/api/admin/artists", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await fetchArtists();
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
        <Button onClick={() => { setError(null); setLoading(true); fetchArtists(); }} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <AdminPageHeader
        title="Artists"
        subtitle="Concert Performers"
        badge={<Badge className="bg-primary/10 text-primary border-0">{artists.length} artists</Badge>}
        actions={
          <Link href="/admin/artists/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Artist
            </Button>
          </Link>
        }
      />

      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Music className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>All Artists</CardTitle>
              <CardDescription>Manage concert performers</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-muted/50">
                <TableHead className="text-muted-foreground">Artist</TableHead>
                <TableHead className="text-muted-foreground">Concert</TableHead>
                <TableHead className="text-muted-foreground">Genre</TableHead>
                <TableHead className="text-muted-foreground">Reveal Date</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No artists added yet.
                  </TableCell>
                </TableRow>
              ) : (
                artists.map((artist) => (
                  <TableRow key={artist.id} className="border-border/50 hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {artist.artist_image_url ? (
                          <img src={artist.artist_image_url} alt={artist.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Music className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <span className="font-medium">{artist.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-primary/10 text-primary border-0">{artist.concert?.concert_name || "—"}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{artist.genre || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-muted/50 border-border/50">
                        <Calendar className="mr-1 h-3 w-3" />
                        {artist.reveal_date?.split("T")[0]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/artists/${artist.id}`}>
                          <Button size="sm" variant="outline" className="border-border/50">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(artist.id)}
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
            <DialogTitle>Delete Artist</DialogTitle>
            <DialogDescription>Are you sure? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-border/50">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
