import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function GoogleSheetsConfig() {
  const [sheetId, setSheetId] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to configure Google Sheets");
        return;
      }

      const { error } = await supabase
        .from('google_sheets_config')
        .insert([
          {
            user_id: user.id,
            sheet_id: sheetId,
            sheet_name: sheetName,
          }
        ]);

      if (error) throw error;

      toast.success("Google Sheet configured successfully!");
      setSheetId("");
      setSheetName("");
    } catch (error) {
      console.error("Error configuring Google Sheet:", error);
      toast.error("Failed to configure Google Sheet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Configure Google Sheet</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sheetId">Google Sheet ID</Label>
          <Input
            id="sheetId"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
            placeholder="Enter the Sheet ID from the URL"
            required
          />
          <p className="text-sm text-muted-foreground">
            Find this in your Google Sheet URL: docs.google.com/spreadsheets/d/[Sheet-ID]/edit
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sheetName">Sheet Name</Label>
          <Input
            id="sheetName"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="e.g. Sales"
            required
          />
          <p className="text-sm text-muted-foreground">
            The name of the specific sheet tab containing your data
          </p>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Configuring..." : "Configure Sheet"}
        </Button>
      </form>
    </div>
  );
}