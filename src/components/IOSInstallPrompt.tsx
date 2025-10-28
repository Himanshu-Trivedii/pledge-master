import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, X, Share2 } from "lucide-react";

const IOSInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(isStandaloneMode);

    // Don't show if in standalone mode
    if (isStandaloneMode) {
      return;
    }

    // Only show if user explicitly requested it
    // We'll trigger it from a button click instead
    const shouldShow = sessionStorage.getItem("show-install-prompt") === "true";
    if (shouldShow) {
      setShowPrompt(true);
      sessionStorage.removeItem("show-install-prompt");
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("ios-install-prompt-dismissed", "true");
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <Alert className="mb-4 border-gold/50 bg-gradient-to-r from-gold/10 to-gold/5">
      <Download className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>Install Gode Jewellers</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-3">
        <p className="mb-3 text-sm font-medium">Follow these steps to install:</p>
        <div className="space-y-3 text-sm bg-background/50 p-3 rounded-lg border border-gold/20">
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold text-primary-foreground font-bold text-xs flex-shrink-0">1</span>
            <div className="flex-1">
              <p className="font-semibold mb-1">Tap the Share button</p>
              <p className="text-muted-foreground text-xs">Look at the bottom of your screen for the square icon with an upward arrow (□↑)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold text-primary-foreground font-bold text-xs flex-shrink-0">2</span>
            <div className="flex-1">
              <p className="font-semibold mb-1">Find "Add to Home Screen"</p>
              <p className="text-muted-foreground text-xs">In the menu that opens, scroll down to find "Add to Home Screen" option</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold text-primary-foreground font-bold text-xs flex-shrink-0">3</span>
            <div className="flex-1">
              <p className="font-semibold mb-1">Tap "Add"</p>
              <p className="text-muted-foreground text-xs">The app icon will appear on your home screen</p>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default IOSInstallPrompt;

