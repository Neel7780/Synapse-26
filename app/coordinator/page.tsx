"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Calendar } from "lucide-react";

interface Event {
  event_id: number;
  event_name: string;
  event_date: string;
  description: string | null;
  event_picture: string | null;
  is_registration_open: boolean | null;
  category_id: number | null;
  event_category: {
    category_name: string;
  } | null;
}

export default function CoordinatorDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/coordinator/events");
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.events);
      } else {
        console.error("Failed to fetch events:", data.error);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Coordinator Dashboard</h1>
        <p className="text-gray-400 mt-2">Manage your assigned events and registrations</p>
      </div>

      {events.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No events assigned to you yet.</p>
              <p className="text-gray-500 text-sm mt-2">Contact the admin to get events assigned.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.event_id}
              href={`/coordinator/events/${event.event_id}`}
              className="block"
            >
              <Card className="bg-zinc-900 border-zinc-800 hover:border-red-600 transition-all duration-300 cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant={event.is_registration_open ? "default" : "secondary"}
                      className={
                        event.is_registration_open
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-600 hover:bg-gray-700"
                      }
                    >
                      {event.is_registration_open ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-xl">
                    {event.event_name}
                  </CardTitle>
                  {event.event_category && (
                    <CardDescription className="text-red-500">
                      {event.event_category.category_name}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {event.description && (
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(event.event_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <span className="text-red-500 text-sm font-medium hover:text-red-400">
                      View Registrations →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
