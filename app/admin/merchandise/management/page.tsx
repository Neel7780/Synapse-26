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
  ShoppingBag,
  Package,
  DollarSign,
  Loader2,
  AlertCircle,
  Check,
  X,
} from "lucide-react";

type Product = {
  product_id: number;
  product_name: string;
  price: number;
  available_sizes: string[] | null;
  product_image: string[] | null;
  description: string | null;
  is_available: boolean;
};

export default function MerchandiseManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/merchandise/management");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProducts(data.products || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingId === null) return;
    try {
      const res = await fetch(
        `/api/admin/merchandise/management/${deletingId}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await fetchProducts();
    } catch (err: unknown) {
      alert(
        "Failed to delete: " +
          (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const availableCount = products.filter((p) => p.is_available).length;
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);

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
            fetchProducts();
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
        title="Merchandise"
        subtitle="Product Management"
        badge={
          <Badge className="bg-primary/10 text-primary border-0">
            {products.length} products
          </Badge>
        }
        actions={
          <Link href="/admin/merchandise/management/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
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
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">{products.length}</p>
            <p className="text-sm text-muted-foreground">Total Products</p>
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
            <p className="text-2xl font-bold">₹{totalValue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>All Products</CardTitle>
              <CardDescription>Manage merchandise inventory</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-muted/50">
                <TableHead className="text-muted-foreground">Product</TableHead>
                <TableHead className="text-muted-foreground">Price</TableHead>
                <TableHead className="text-muted-foreground">Sizes</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No products added yet.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow
                    key={product.product_id}
                    className="border-border/50 hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.product_image &&
                        product.product_image.length > 0 ? (
                          <img
                            src={product.product_image[0]}
                            alt={product.product_name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{product.product_name}</p>
                          {product.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{product.price}
                    </TableCell>
                    <TableCell>
                      {product.available_sizes?.length ? (
                        <div className="flex gap-1 flex-wrap">
                          {product.available_sizes.map((size) => (
                            <Badge
                              key={size}
                              variant="secondary"
                              className="text-xs"
                            >
                              {size}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          product.is_available
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30"
                        }
                      >
                        {product.is_available ? (
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
                        <Link
                          href={`/admin/merchandise/management/${product.product_id}`}
                        >
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
                          onClick={() => handleDeleteClick(product.product_id)}
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
            <DialogTitle>Delete Product</DialogTitle>
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
