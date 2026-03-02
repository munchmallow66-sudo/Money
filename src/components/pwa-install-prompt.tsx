"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, X, Share, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if it's iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // Check if user has previously dismissed the prompt
    const hasDismissed = localStorage.getItem("pwa-prompt-dismissed");
    const dismissedTime = hasDismissed ? parseInt(hasDismissed, 10) : 0;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const shouldShow = !dismissedTime || Date.now() - dismissedTime > oneWeek;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (shouldShow) {
        setShowInstallDialog(true);
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setShowInstallDialog(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Show iOS install prompt after 3 seconds if not dismissed
    if (isIOSDevice && shouldShow) {
      const timer = setTimeout(() => {
        setShowInstallDialog(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
    setShowInstallDialog(false);
  };

  const handleDismiss = () => {
    setShowInstallDialog(false);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  // Don't show if already installed
  if (isInstalled) return null;

  return (
    <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            ติดตั้ง Money Summary
          </DialogTitle>
          <DialogDescription>
            ติดตั้งแอปเพื่อเข้าถึงได้เร็วขึ้นและใช้งานได้แม้ไม่มีอินเทอร์เน็ต
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
              <img
                src="/icons/icon-192x192.png"
                alt="Money Summary Icon"
                className="w-16 h-16"
              />
            </div>
          </div>

          {isIOS ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>เพื่อติดตั้งบน iOS:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  แตะที่{" "}
                  <Share className="h-4 w-4 inline mx-1 text-primary" />{" "}
                  แชร์ที่ด้านล่าง
                </li>
                <li>
                  เลื่อนลงและแตะ{" "}
                  <strong className="text-foreground">
                    เพิ่มไปยังหน้าจอโฮม
                  </strong>
                </li>
              </ol>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              ติดตั้งแอปลงบนอุปกรณ์ของคุณเพื่อประสบการณ์ที่ดีที่สุด
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {!isIOS && deferredPrompt && (
            <Button onClick={handleInstallClick} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              ติดตั้งเลย
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleDismiss}
            className={!isIOS && deferredPrompt ? "flex-1" : "w-full"}
          >
            <X className="h-4 w-4 mr-2" />
            ยังก่อน
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
