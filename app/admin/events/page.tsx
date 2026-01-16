"use client";

import { useState, useRef } from "react";
import { AdminPageHeader } from "@/components/admin/ui/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
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
} from "lucide-react";

type ParticipationCategory = {
  enabled: boolean;
  fee: number;
  minParticipants?: number;
  maxParticipants?: number;
};

type Event = {
  id: number;
  name: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  rulebookLink: string;
  description?: string;
  registrationOpen: boolean;
  freeForDau: boolean;
  participationCategories: {
    solo: ParticipationCategory;
    duet: ParticipationCategory;
    group: ParticipationCategory;
  };
};

const initialEvents: Event[] = [
  {
    id: 1,
    name: "Hackathon 2025",
    category: "Technical",
    date: "2025-12-20",
    time: "10:00",
    venue: "Auditorium A",
    rulebookLink: "https://drive.google.com/...",
    registrationOpen: true,
    freeForDau: true,
    participationCategories: {
      solo: { enabled: true, fee: 100 },
      duet: { enabled: true, fee: 200 },
      group: { enabled: false, fee: 500, minParticipants: 3, maxParticipants: 8 },
    },
  },
  {
    id: 2,
    name: "Dance Battle",
    category: "Cultural",
    date: "2025-12-21",
    time: "18:30",
    venue: "Main Stage",
    rulebookLink: "https://drive.google.com/...",
    registrationOpen: false,
    freeForDau: false,
    participationCategories: {
      solo: { enabled: true, fee: 150 },
      duet: { enabled: true, fee: 250 },
      group: { enabled: true, fee: 800, minParticipants: 4, maxParticipants: 10 },
    },
  },
  {
    id: 3,
    name: "Coding Competition",
    category: "Technical",
    date: "2025-12-22",
    time: "14:00",
    venue: "Computer Lab",
    rulebookLink: "https://drive.google.com/...",
    registrationOpen: true,
    freeForDau: false,
    participationCategories: {
      solo: { enabled: true, fee: 75 },
      duet: { enabled: false, fee: 0 },
      group: { enabled: false, fee: 0 },
    },
  },
];

const categories = ["Technical", "Cultural", "Sports", "Workshop", "Gaming"];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [formData, setFormData] = useState({
    name: "",
    category: "Technical",
    date: "",
    time: "",
    venue: "",
    rulebookLink: "",
    description: "",
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const nextIdRef = useRef<number>(Date.now());

  // Create new event
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Event = {
      id: nextIdRef.current++,
      name: formData.name,
      category: formData.category,
      date: formData.date,
      time: formData.time,
      venue: formData.venue,
      rulebookLink: formData.rulebookLink,
      description: formData.description,
      registrationOpen: true,
      freeForDau: false,
      participationCategories: {
        solo: { enabled: true, fee: 100 },
        duet: { enabled: false, fee: 200 },
        group: { enabled: false, fee: 500, minParticipants: 3, maxParticipants: 8 },
      },
    };
    setEvents([...events, newEvent]);
    setFormData({ name: "", category: "Technical", date: "", time: "", venue: "", rulebookLink: "", description: "" });
  };

  // Toggle registration
  const toggleRegistration = (id: number) => {
    setEvents(events.map(e => e.id === id ? { ...e, registrationOpen: !e.registrationOpen } : e));
  };

  // Edit event
  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setIsEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editingEvent) return;
    setEvents(events.map(e => e.id === editingEvent.id ? editingEvent : e));
    setIsEditOpen(false);
    setEditingEvent(null);
  };

  // Delete event
  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingId !== null) {
      setEvents(events.filter(e => e.id !== deletingId));
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Synapse 2026"
                required
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger className="bg-muted/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Venue</label>
              <Input
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g., Main Auditorium"
                required
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rulebook Link</label>
              <Input
                value={formData.rulebookLink}
                onChange={(e) => setFormData({ ...formData, rulebookLink: e.target.value })}
                placeholder="https://..."
                className="bg-muted/50 border-border/50"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end">
              <Button type="submit" className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white border-0">
                <Plus className="mr-2 h-4 w-4" />
                Add Event
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
                <CardDescription>Manage event details and registrations</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-muted/50">
                <TableHead className="text-muted-foreground">Event</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Date & Time</TableHead>
                <TableHead className="text-muted-foreground">Venue</TableHead>
                <TableHead className="text-muted-foreground">Fees</TableHead>
                <TableHead className="text-muted-foreground">Registration</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No events created yet. Add your first event above!
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id} className="border-border/50 hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/20 text-red-400">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{event.name}</p>
                          {event.rulebookLink && (
                            <a href={event.rulebookLink} target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:underline flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" /> Rulebook
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getCategoryColor(event.category)}>
                        <Tag className="mr-1 h-3 w-3" />
                        {event.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="bg-muted/50 border-border/50">
                          <Calendar className="mr-1 h-3 w-3" />
                          {event.date}
                        </Badge>
                        <Badge variant="secondary" className="bg-muted/50 border-border/50">
                          <Clock className="mr-1 h-3 w-3" />
                          {event.time}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-muted/50 border-border/50">
                        <MapPin className="mr-1 h-3 w-3" />
                        {event.venue}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {event.participationCategories.solo.enabled && (
                          <Badge variant="secondary" className="text-xs bg-muted/50 border-border/50">Solo: ₹{event.participationCategories.solo.fee}</Badge>
                        )}
                        {event.participationCategories.duet.enabled && (
                          <Badge variant="secondary" className="text-xs bg-muted/50 border-border/50">Duet: ₹{event.participationCategories.duet.fee}</Badge>
                        )}
                        {event.participationCategories.group.enabled && (
                          <Badge variant="secondary" className="text-xs bg-muted/50 border-border/50">Group: ₹{event.participationCategories.group.fee}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={event.registrationOpen}
                          onCheckedChange={() => toggleRegistration(event.id)}
                        />
                        <Badge className={event.registrationOpen ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}>
                          {event.registrationOpen ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                          {event.registrationOpen ? "Open" : "Closed"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(event)} className="border-border/50 hover:bg-muted/50">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteClick(event.id)} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
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
      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) setEditingEvent(null); }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update event details and participation settings</DialogDescription>
          </DialogHeader>
          {editingEvent && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="details">Event Details</TabsTrigger>
                <TabsTrigger value="fees">Participation & Fees</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Event Name</label>
                    <Input
                      value={editingEvent.name}
                      onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={editingEvent.category} onValueChange={(v) => setEditingEvent({ ...editingEvent, category: v })}>
                      <SelectTrigger className="bg-muted/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={editingEvent.date}
                      onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <Input
                      type="time"
                      value={editingEvent.time}
                      onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">Venue</label>
                    <Input
                      value={editingEvent.venue}
                      onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div>
                    <p className="font-medium">Free for DAU Students</p>
                    <p className="text-sm text-muted-foreground">When enabled, DAU students can register for free</p>
                  </div>
                  <Switch
                    checked={editingEvent.freeForDau}
                    onCheckedChange={(v) => setEditingEvent({ ...editingEvent, freeForDau: v })}
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
                    <Switch
                      checked={editingEvent.participationCategories.solo.enabled}
                      onCheckedChange={(v) => setEditingEvent({
                        ...editingEvent,
                        participationCategories: {
                          ...editingEvent.participationCategories,
                          solo: { ...editingEvent.participationCategories.solo, enabled: v }
                        }
                      })}
                    />
                  </div>
                  {editingEvent.participationCategories.solo.enabled && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={editingEvent.participationCategories.solo.fee}
                        onChange={(e) => setEditingEvent({
                          ...editingEvent,
                          participationCategories: {
                            ...editingEvent.participationCategories,
                            solo: { ...editingEvent.participationCategories.solo, fee: parseInt(e.target.value) || 0 }
                          }
                        })}
                        className="w-32 bg-muted/50 border-border/50"
                      />
                      <span className="text-sm text-muted-foreground">per person</span>
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
                      checked={editingEvent.participationCategories.duet.enabled}
                      onCheckedChange={(v) => setEditingEvent({
                        ...editingEvent,
                        participationCategories: {
                          ...editingEvent.participationCategories,
                          duet: { ...editingEvent.participationCategories.duet, enabled: v }
                        }
                      })}
                    />
                  </div>
                  {editingEvent.participationCategories.duet.enabled && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={editingEvent.participationCategories.duet.fee}
                        onChange={(e) => setEditingEvent({
                          ...editingEvent,
                          participationCategories: {
                            ...editingEvent.participationCategories,
                            duet: { ...editingEvent.participationCategories.duet, fee: parseInt(e.target.value) || 0 }
                          }
                        })}
                        className="w-32 bg-muted/50 border-border/50"
                      />
                      <span className="text-sm text-muted-foreground">per team</span>
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
                      checked={editingEvent.participationCategories.group.enabled}
                      onCheckedChange={(v) => setEditingEvent({
                        ...editingEvent,
                        participationCategories: {
                          ...editingEvent.participationCategories,
                          group: { ...editingEvent.participationCategories.group, enabled: v }
                        }
                      })}
                    />
                  </div>
                  {editingEvent.participationCategories.group.enabled && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={editingEvent.participationCategories.group.fee}
                          onChange={(e) => setEditingEvent({
                            ...editingEvent,
                            participationCategories: {
                              ...editingEvent.participationCategories,
                              group: { ...editingEvent.participationCategories.group, fee: parseInt(e.target.value) || 0 }
                            }
                          })}
                          className="w-32 bg-muted/50 border-border/50"
                        />
                        <span className="text-sm text-muted-foreground">per team</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Min:</span>
                          <Input
                            type="number"
                            value={editingEvent.participationCategories.group.minParticipants || 3}
                            onChange={(e) => setEditingEvent({
                              ...editingEvent,
                              participationCategories: {
                                ...editingEvent.participationCategories,
                                group: { ...editingEvent.participationCategories.group, minParticipants: parseInt(e.target.value) || 3 }
                              }
                            })}
                            className="w-20 bg-muted/50 border-border/50"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Max:</span>
                          <Input
                            type="number"
                            value={editingEvent.participationCategories.group.maxParticipants || 8}
                            onChange={(e) => setEditingEvent({
                              ...editingEvent,
                              participationCategories: {
                                ...editingEvent.participationCategories,
                                group: { ...editingEvent.participationCategories.group, maxParticipants: parseInt(e.target.value) || 8 }
                              }
                            })}
                            className="w-20 bg-muted/50 border-border/50"
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">members</span>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-border/50">Cancel</Button>
            <Button onClick={handleEditSave} className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white border-0">
              Save Changes
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
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
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
