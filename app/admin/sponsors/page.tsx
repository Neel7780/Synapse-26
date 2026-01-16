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
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Building2,
  Award,
  Globe,
  GripVertical,
  Loader2,
  Trophy,
  Medal,
  Crown,
} from "lucide-react";

type Sponsor = {
  sponsor_id: number;
  name: string;
  tier: string | null;
  website_url: string | null;
  logo_url: string | null;
  description: string | null;
  display_order?: number | null;
};

const tierConfig: Record<string, { bg: string; text: string; border: string; Icon: React.ComponentType<{ className?: string }> }> = {
  Platinum: { bg: "bg-slate-400/10", text: "text-slate-300", border: "border-slate-400/30", Icon: Crown },
  Gold: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", Icon: Trophy },
  Silver: { bg: "bg-slate-300/10", text: "text-slate-400", border: "border-slate-300/30", Icon: Medal },
  Bronze: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", Icon: Award },
};

// Sortable Item Component
function SortableSponsorItem({ sponsor, onDeleteClick, getTierStyle }: {
  sponsor: Sponsor;
  onDeleteClick: (id: number) => void;
  getTierStyle: (tier: string | null) => { bg: string; text: string; border: string; Icon: React.ComponentType<{ className?: string }> };
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sponsor.sponsor_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const tier = sponsor.tier || "Other";
  const tierStyle = getTierStyle(sponsor.tier);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group p-4 rounded-xl border border-border/40 bg-card hover:border-primary/30 transition-all ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-secondary/50 rounded-lg"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Sponsor Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            <tierStyle.Icon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{sponsor.name}</h3>
            <Badge className={`${tierStyle.bg} ${tierStyle.text} ${tierStyle.border} text-xs mt-1`}>
              <Award className="mr-1 h-3 w-3" />
              {tier}
            </Badge>
          </div>
        </div>

        {/* Website Link */}
        {sponsor.website_url && (
          <a
            href={sponsor.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-sm text-primary hover:underline shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="h-4 w-4" />
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Link href={`/admin/sponsors/${sponsor.sponsor_id}`}>
            <Button variant="outline" size="sm" className="border-border/50">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteClick(sponsor.sponsor_id)}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch sponsors
  useEffect(() => {
    async function fetchSponsors() {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/sponsors");
        if (!response.ok) throw new Error("Failed to fetch sponsors");
        const data = await response.json();
        
        // Ensure each sponsor has a display_order
        const sponsorsWithOrder = data.sponsors.map((sponsor: Sponsor, index: number) => ({
          ...sponsor,
          display_order: sponsor.display_order ?? index + 1,
        }));
        
        // Sort by display_order
        sponsorsWithOrder.sort((a: Sponsor, b: Sponsor) => 
          (a.display_order ?? 0) - (b.display_order ?? 0)
        );
        
        setSponsors(sponsorsWithOrder);
      } catch (error) {
        console.error("Error fetching sponsors:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSponsors();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sponsors.findIndex((s) => s.sponsor_id === active.id);
      const newIndex = sponsors.findIndex((s) => s.sponsor_id === over.id);

      const newSponsors = arrayMove(sponsors, oldIndex, newIndex);
      setSponsors(newSponsors);

      // Update display_order in database
      try {
        setSaving(true);
        const orders = newSponsors.map((sponsor, index) => ({
          id: sponsor.sponsor_id,
          order: index + 1,
        }));

        const response = await fetch("/api/admin/sponsors/reorder", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orders }),
        });

        if (!response.ok) {
          throw new Error("Failed to save order");
        }
      } catch (error) {
        console.error("Error updating sponsor order:", error);
        // Revert on error
        setSponsors(sponsors);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingId !== null) {
      try {
        const response = await fetch(`/api/admin/sponsors/${deletingId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setSponsors(sponsors.filter((s) => s.sponsor_id !== deletingId));
        } else {
          console.error("Failed to delete sponsor");
        }
      } catch (error) {
        console.error("Error deleting sponsor:", error);
      }
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const getTierStyle = (tier: string | null) => {
    return tierConfig[tier || ""] || { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", Icon: Building2 };
  };

  // Group sponsors by tier for stats
  const groupedSponsors = sponsors.reduce((acc, sponsor) => {
    const tier = sponsor.tier || "Other";
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(sponsor);
    return acc;
  }, {} as Record<string, Sponsor[]>);

  const tierOrder = ["Platinum", "Gold", "Silver", "Bronze"];

  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <AdminPageHeader title="Sponsors" subtitle="Partnerships" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <AdminPageHeader
        title="Sponsors"
        subtitle="Partnerships"
        badge={
          <Badge className="bg-primary/10 text-primary border-0">
            {sponsors.length} partners
          </Badge>
        }
        actions={
          <div className="flex items-center gap-3">
            {saving && (
              <Badge variant="secondary" className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving order...
              </Badge>
            )}
            <Link href="/admin/sponsors/new">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Sponsor
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tierOrder.map((tier) => {
          const style = getTierStyle(tier);
          const IconComponent = style.Icon;
          const count = groupedSponsors[tier]?.length || 0;
          return (
            <Card key={tier} className="border-border/40">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className="h-6 w-6 text-muted-foreground" />
                  <Badge className={`${style.bg} ${style.text} ${style.border}`}>
                    {tier}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground">{tier} Sponsors</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Draggable Sponsors List */}
      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle>All Sponsors</CardTitle>
              <CardDescription>
                Drag and drop to reorder sponsors. The order will be saved automatically.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {sponsors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sponsors added yet.</p>
              <p className="text-sm">Add your first sponsor to get started!</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sponsors.map((s) => s.sponsor_id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {sponsors.map((sponsor) => (
                    <SortableSponsorItem
                      key={sponsor.sponsor_id}
                      sponsor={sponsor}
                      onDeleteClick={handleDeleteClick}
                      getTierStyle={getTierStyle}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Delete Sponsor</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this sponsor? This action cannot be undone.
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
