import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function GoogleSheetsConfig() {
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    fetchCurrentConfig();
  }, []);

  const fetchCurrentConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to configure Google Sheets");
        return;
      }

      const { data, error } = await supabase
        .from('google_sheets_config')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching config:", error);
        setError(error.message);
        return;
      }

      if (data) {
        setCurrentConfig(data);
        setIsConfigured(true);
      }
    } catch (err) {
      console.error("Error fetching current config:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const extractSheetId = (url: string) => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + 5, 100);
      });
    }, 100);
    return interval;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const progressInterval = simulateProgress();

    try {
      const sheetId = extractSheetId(sheetUrl);
      if (!sheetId) {
        toast.error("Invalid Google Sheet URL");
        setError("Please provide a valid Google Sheet URL");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to configure Google Sheets");
        return;
      }

      const { error } = await supabase
        .from('google_sheets_config')
        .upsert({
          user_id: user.id,
          sheet_id: sheetId,
          sheet_name: sheetName
        });

      if (error) {
        console.error("Error saving config:", error);
        setError(error.message);
        toast.error("Failed to save Google Sheet configuration");
        return;
      }

      toast.success("Google Sheet configured successfully!");
      setIsConfigured(true);
      await fetchCurrentConfig();
    } catch (error) {
      console.error("Error configuring Google Sheet:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      toast.error("Failed to configure Google Sheet");
    } finally {
      setIsSubmitting(false);
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  };

  if (isConfigured && !error) {
    return (
      <div className="rounded-xl bg-white/80 backdrop-blur-lg p-6 shadow-lg border border-gray-100">
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            Google Sheet configured and ready to use
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white/80 backdrop-blur-lg p-6 shadow-lg border border-gray-100">
      <h3 className="mb-4 text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        Configure Google Sheet
      </h3>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sheetUrl" className="text-sm font-medium text-gray-700">Google Sheet URL</Label>
          <Input
            id="sheetUrl"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/[Sheet-ID]/edit?usp=sharing"
            className="border-gray-200 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sheetName" className="text-sm font-medium text-gray-700">Sheet Name</Label>
          <Input
            id="sheetName"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="e.g. Sales"
            className="border-gray-200 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {isSubmitting && progress > 0 && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full h-2" />
            <p className="text-sm text-gray-500 text-center">
              {progress < 100 ? "Configuring your Google Sheet..." : "Configuration complete!"}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200"
        >
          {isSubmitting ? "Configuring..." : "Configure Sheet"}
        </Button>
      </form>
    </div>
  );
}