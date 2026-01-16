"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  disabled?: boolean;
}

export function TimePicker({
  value,
  onChange,
  id,
  required = false,
  disabled = false,
}: TimePickerProps) {
  const [hours, setHours] = React.useState<string>("");
  const [minutes, setMinutes] = React.useState<string>("");
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse time value (HH:MM format)
  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      setHours(h || "");
      setMinutes(m || "");
    } else {
      setHours("");
      setMinutes("");
    }
  }, [value]);

  // Update parent when hours or minutes change
  const handleTimeChange = (h: string, m: string) => {
    setHours(h);
    setMinutes(m);
    
    if (h && m) {
      const formattedHours = h.padStart(2, "0");
      const formattedMinutes = m.padStart(2, "0");
      onChange(`${formattedHours}:${formattedMinutes}`);
    }
  };

  const formatDisplayTime = () => {
    if (!hours || !minutes) return "Select time";
    const h = parseInt(hours);
    const m = parseInt(minutes);
    if (isNaN(h) || isNaN(m)) return "Select time";
    
    const hour12 = h % 12 || 12;
    const ampm = h >= 12 ? "PM" : "AM";
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 23)) {
      handleTimeChange(val, minutes);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
      handleTimeChange(hours, val);
    }
  };

  const handleQuickTime = (h: number, m: number) => {
    handleTimeChange(h.toString(), m.toString());
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className="w-full justify-start text-left font-normal h-9"
            disabled={disabled}
            type="button"
            aria-required={required}
          >
            <Clock className="mr-2 h-4 w-4" />
            {value ? formatDisplayTime() : <span className="text-muted-foreground">Select time</span>}
          </Button>
        </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Time</Label>
            <div className="flex items-center gap-2">
              <div className="space-y-1">
                <Label htmlFor="hours" className="text-xs text-muted-foreground">
                  Hours
                </Label>
                <Input
                  id="hours"
                  type="text"
                  inputMode="numeric"
                  value={hours}
                  onChange={handleHoursChange}
                  placeholder="00"
                  className="w-16 text-center"
                  maxLength={2}
                />
              </div>
              <span className="text-2xl font-bold mt-6">:</span>
              <div className="space-y-1">
                <Label htmlFor="minutes" className="text-xs text-muted-foreground">
                  Minutes
                </Label>
                <Input
                  id="minutes"
                  type="text"
                  inputMode="numeric"
                  value={minutes}
                  onChange={handleMinutesChange}
                  placeholder="00"
                  className="w-16 text-center"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick Select</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "9 AM", h: 9, m: 0 },
                { label: "12 PM", h: 12, m: 0 },
                { label: "3 PM", h: 15, m: 0 },
                { label: "6 PM", h: 18, m: 0 },
                { label: "9 PM", h: 21, m: 0 },
                { label: "12 AM", h: 0, m: 0 },
              ].map((time) => (
                <Button
                  key={time.label}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    handleQuickTime(time.h, time.m);
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  {time.label}
                </Button>
              ))}
            </div>
          </div>

          {value && (
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setHours("");
                  setMinutes("");
                  onChange("");
                  setIsOpen(false);
                }}
                type="button"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
