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
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Building2,
  Award,
  Globe,
  Loader2,
  AlertCircle,
} from "lucide-react";

type Category = {
  sponsor_category_id: number;
  tier: string;
  rank: number | null;
};

type Sponsor = {
  sponsor_id: number;
  name: string;
  category_id: number;
  website_url: string;
  logo_url: string;
  description?: string;
  category?: Category;
};

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rankingMode, setRankingMode] = useState(false);
  const [rankValues, setRankValues] = useState<Record<number, string>>({});
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    tier: "",
    rank: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sponsorsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/sponsors"),
        fetch("/api/admin/sponsor-categories"),
      ]);

      const sponsorsData = await sponsorsRes.json();
      const categoriesData = await categoriesRes.json();

      if (sponsorsData.error) throw new Error(sponsorsData.error);
      if (categoriesData.error) throw new Error(categoriesData.error);

      setSponsors(sponsorsData.sponsors || []);
      setCategories(categoriesData.categories || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching data:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnterRankingMode = () => {
    // Initialize rank values from current categories
    const initialRanks: Record<number, string> = {};
    categories.forEach((category) => {
      initialRanks[category.sponsor_category_id] = category.rank
        ? String(category.rank)
        : "";
    });
    setRankValues(initialRanks);
    setRankingMode(true);
  };

  const handleCancelRanking = () => {
    setRankingMode(false);
    setRankValues({});
  };

  const handleSaveRanks = async () => {
    setSaving(true);
    try {
      // Prepare ranks array for bulk update
      const ranks = Object.entries(rankValues).map(([category_id, rank]) => ({
        category_id: parseInt(category_id, 10),
        rank: rank.trim() === "" ? null : parseInt(rank, 10),
      }));

      const res = await fetch("/api/admin/sponsor-categories/bulk-rank", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ranks }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      alert("Category ranks updated successfully!");
      setRankingMode(false);
      setRankValues({});
      await fetchData(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert("Failed to update ranks: " + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingId === null) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/sponsors/${deletingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await fetchData();
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryData.tier.trim()) {
      alert("Category name is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/sponsor-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: newCategoryData.tier,
          rank: newCategoryData.rank
            ? parseInt(newCategoryData.rank, 10)
            : null,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      alert("Category created successfully!");
      setAddCategoryDialogOpen(false);
      setNewCategoryData({ tier: "", rank: "" });
      await fetchData();
    } catch (err: any) {
      alert("Failed to create category: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Group sponsors by category
  const sponsorsByCategory = sponsors.reduce(
    (acc, sponsor) => {
      const categoryId = sponsor.category_id;
      if (!acc[categoryId]) acc[categoryId] = [];
      acc[categoryId].push(sponsor);
      return acc;
    },
    {} as Record<number, Sponsor[]>,
  );

  // Sort categories by rank
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.rank === null && b.rank === null) return 0;
    if (a.rank === null) return 1;
    if (b.rank === null) return -1;
    return a.rank - b.rank;
  });

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
        <Button onClick={fetchData} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  // Check if sponsors exist but no categories
  if (sponsors.length > 0 && categories.length === 0) {
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
        />
        <Card className="border-border/40">
          <CardContent className="p-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-lg font-semibold mb-2">
                No Categories Found
              </h3>
              <p className="text-muted-foreground mb-4">
                You have {sponsors.length} sponsor(s) in the database, but no
                categories are defined.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Please add categories to your{" "}
                <code className="bg-muted px-2 py-1 rounded">
                  sponsor_category
                </code>{" "}
                table first.
              </p>
              <div className="bg-muted p-4 rounded-lg text-left max-w-2xl mx-auto">
                <p className="text-xs font-mono mb-2">Example SQL:</p>
                <pre className="text-xs font-mono overflow-x-auto">
                  {`INSERT INTO sponsor_category (tier, rank) VALUES 
('Title', 1),
('Co-Title', 2),
('Platinum', 3),
('Associate', 4);`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
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
                Saving ranks...
              </Badge>
            )}
            {rankingMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelRanking}
                  disabled={saving}
                  className="border-border/50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveRanks}
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Award className="mr-2 h-4 w-4" />
                  Save Category Ranks
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setAddCategoryDialogOpen(true)}
                  className="border-border/50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
                <Button
                  variant="outline"
                  onClick={handleEnterRankingMode}
                  className="border-border/50"
                >
                  <Award className="mr-2 h-4 w-4" />
                  Rank Categories
                </Button>
                <Link href="/admin/sponsors/new">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Sponsor
                  </Button>
                </Link>
              </>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedCategories.map((category) => {
          const count =
            sponsorsByCategory[category.sponsor_category_id]?.length || 0;
          return (
            <Card
              key={category.sponsor_category_id}
              className="border-border/40"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="h-8 w-8 text-primary" />
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    {category.tier}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground">
                  {category.tier} Sponsors
                </p>
                {category.rank && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Rank: {category.rank}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category Ranking Mode */}
      {rankingMode ? (
        <Card className="border-border/40">
          <CardHeader className="border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle>Rank Categories</CardTitle>
                <CardDescription>
                  Assign rank numbers to categories. Lower numbers appear first.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {categories.map((category) => {
                const count =
                  sponsorsByCategory[category.sponsor_category_id]?.length || 0;
                return (
                  <div
                    key={category.sponsor_category_id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border/40 bg-card"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{category.tier}</h4>
                        <p className="text-sm text-muted-foreground">
                          {count} sponsor{count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground whitespace-nowrap">
                        Rank:
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={rankValues[category.sponsor_category_id] || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setRankValues({
                            ...rankValues,
                            [category.sponsor_category_id]: e.target.value,
                          })
                        }
                        placeholder="No rank"
                        className="w-24 bg-muted/50 border-border/50"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Sponsors List by Category */
        <div className="space-y-6">
          {sortedCategories.map((category) => {
            const categorySponsors =
              sponsorsByCategory[category.sponsor_category_id] || [];

            if (categorySponsors.length === 0) return null;

            return (
              <Card
                key={category.sponsor_category_id}
                className="border-border/40"
              >
                <CardHeader className="border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle>{category.tier}</CardTitle>
                      <CardDescription>
                        {categorySponsors.length} sponsor
                        {categorySponsors.length !== 1 ? "s" : ""}
                        {category.rank && ` • Rank ${category.rank}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categorySponsors.map((sponsor) => (
                      <div
                        key={sponsor.sponsor_id}
                        className="group p-5 rounded-xl border border-border/40 bg-card hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-xl">
                              <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{sponsor.name}</h3>
                            </div>
                          </div>
                        </div>

                        {sponsor.website_url && (
                          <a
                            href={sponsor.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline mb-4"
                          >
                            <Globe className="h-3 w-3" />
                            {sponsor.website_url.replace(/^https?:\/\//, "")}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}

                        <div className="flex gap-2 pt-3 border-t border-border/40">
                          <Link
                            href={`/admin/sponsors/${sponsor.sponsor_id}`}
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-border/50"
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteClick(sponsor.sponsor_id)
                            }
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {sponsors.length === 0 && (
            <Card className="border-border/40">
              <CardContent className="p-12">
                <div className="text-center text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sponsors added yet.</p>
                  <p className="text-sm">
                    Add your first sponsor to get started!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog
        open={addCategoryDialogOpen}
        onOpenChange={setAddCategoryDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new sponsor category/tier
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Name *</label>
              <Input
                value={newCategoryData.tier}
                onChange={(e) =>
                  setNewCategoryData({
                    ...newCategoryData,
                    tier: e.target.value,
                  })
                }
                placeholder="e.g., Gold, Silver, Bronze"
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rank (Optional)</label>
              <Input
                type="number"
                min="1"
                value={newCategoryData.rank}
                onChange={(e) =>
                  setNewCategoryData({
                    ...newCategoryData,
                    rank: e.target.value,
                  })
                }
                placeholder="Display order"
                className="bg-muted/50 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddCategoryDialogOpen(false);
                setNewCategoryData({ tier: "", rank: "" });
              }}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Delete Sponsor</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this sponsor? This action cannot
              be undone.
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
