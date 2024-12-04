import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function GoogleSheetsConfig() {
  const [sheetId, setSheetId] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentConfig();
  }, []);

  const fetchCurrentConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('google_sheets_config')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("Error fetching config:", error);
        return;
      }

      if (data) {
        setCurrentConfig(data);
        setSheetId(data.sheet_id || "");
        setSheetName(data.sheet_name || "");
      }
    } catch (err) {
      console.error("Error fetching current config:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to configure Google Sheets");
        return;
      }

      console.log("Submitting config:", {
        user_id: user.id,
        sheet_id: sheetId,
        sheet_name: sheetName
      });

      const { data, error } = await supabase
        .from('google_sheets_config')
        .upsert({
          user_id: user.id,
          sheet_id: sheetId,
          sheet_name: sheetName,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error("Error saving config:", error);
        setError(error.message);
        toast.error("Failed to save Google Sheet configuration");
        return;
      }

      console.log("Config saved successfully:", data);
      toast.success("Google Sheet configured successfully!");
      await fetchCurrentConfig();
    } catch (error) {
      console.error("Error configuring Google Sheet:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      toast.error("Failed to configure Google Sheet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Configure Google Sheet</h3>
      
      {currentConfig && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Current configuration: Sheet ID: {currentConfig.sheet_id}, Sheet Name: {currentConfig.sheet_name}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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