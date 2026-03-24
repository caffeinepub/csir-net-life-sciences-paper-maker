import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Settings } from "../backend.d";
import { useGetSettings, useUpdateSettings } from "../hooks/useQueries";

export default function SettingsPage() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState<Settings>({
    instituteName: "",
    watermarkText: "",
    footerText: "",
    negativeMarkingEnabled: false,
    negativeMarkingValue: 0.25,
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const set = (field: keyof Settings, value: string | boolean | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(form);
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-ocid="settings.section">
      {/* Institute */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Institute Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="inst-name">Institute Name</Label>
            <Input
              id="inst-name"
              placeholder="e.g., Alpha Coaching Institute"
              value={form.instituteName}
              onChange={(e) => set("instituteName", e.target.value)}
              data-ocid="settings.institute_name.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="footer">Footer Text</Label>
            <Input
              id="footer"
              placeholder="Footer text for PDF..."
              value={form.footerText}
              onChange={(e) => set("footerText", e.target.value)}
              data-ocid="settings.footer_text.input"
            />
          </div>
        </CardContent>
      </Card>

      {/* PDF Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">PDF Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="watermark">Watermark Text</Label>
            <Input
              id="watermark"
              placeholder="e.g., CONFIDENTIAL or institute name"
              value={form.watermarkText}
              onChange={(e) => set("watermarkText", e.target.value)}
              data-ocid="settings.watermark.input"
            />
          </div>

          {/* Negative Marking */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Negative Marking</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Deduct marks for wrong answers
                </p>
              </div>
              <Switch
                checked={form.negativeMarkingEnabled}
                onCheckedChange={(v) => set("negativeMarkingEnabled", v)}
                data-ocid="settings.negative_marking.switch"
              />
            </div>

            {form.negativeMarkingEnabled && (
              <div className="space-y-1.5 pl-4 border-l-2 border-[oklch(0.93_0.05_255)]">
                <Label htmlFor="neg-value">
                  Negative Marks Per Wrong Answer
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">−</span>
                  <Input
                    id="neg-value"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={form.negativeMarkingValue}
                    onChange={(e) =>
                      set(
                        "negativeMarkingValue",
                        Number.parseFloat(e.target.value) || 0,
                      )
                    }
                    className="w-28"
                    data-ocid="settings.negative_marking_value.input"
                  />
                  <span className="text-sm text-muted-foreground">marks</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Common values: 0.25 (1/4), 0.33 (1/3), 1.00 (full mark)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={updateSettings.isPending}
        className="w-full h-11 bg-[oklch(0.17_0.04_255)] hover:bg-[oklch(0.24_0.06_255)] text-white gap-2"
        data-ocid="settings.save.submit_button"
      >
        {updateSettings.isPending ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Save size={16} /> Save Settings
          </>
        )}
      </Button>
    </div>
  );
}
