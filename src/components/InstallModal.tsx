import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, X, CheckCircle } from "lucide-react";

interface InstallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InstallModal = ({ open, onOpenChange }: InstallModalProps) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Download className="h-6 w-6 text-gold" />
            Install Gode Jewellers
          </DialogTitle>
          <DialogDescription>
            Add this app to your home screen for quick access
          </DialogDescription>
        </DialogHeader>

        {isIOS ? (
          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-r from-gold/10 to-gold/5 p-4 rounded-lg border border-gold/20">
              <p className="text-sm font-medium mb-3 text-foreground">
                On iPhone/iPad, follow these steps:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gold text-primary-foreground font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-2">Tap the Share button</p>
                    <div className="bg-background p-3 rounded border border-border flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-gold" />
                      <span className="text-sm text-muted-foreground">Find this icon at the bottom of your screen</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gold text-primary-foreground font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-2">Scroll down to find "Add to Home Screen"</p>
                    <div className="bg-background p-3 rounded border border-border">
                      <p className="text-sm text-muted-foreground">
                        In the share menu, scroll down to see more options. Look for the icon that says "Add to Home Screen"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gold text-primary-foreground font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-2">Tap "Add"</p>
                    <div className="bg-background p-3 rounded border border-border flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="text-sm text-muted-foreground">The app will appear on your home screen!</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gold/10 rounded border border-gold/30">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> This is the standard way to install web apps on iOS devices. 
                  You must use the Safari Share button to add apps to your home screen.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              On Android or other browsers, look for the install icon in your browser's address bar,
              or check the browser menu for "Install" or "Add to Home Screen" option.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallModal;

