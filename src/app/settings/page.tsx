"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, Moon, Sun, User, Shield, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  async function handleSignOut() {
    await signOut({ callbackUrl: "/" });
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6 max-w-lg md:max-w-2xl lg:max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">ตั้งค่า</h1>

        {/* User Profile */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-16 h-16 rounded-2xl"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-semibold text-lg">{session?.user?.name}</p>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Options */}
        <div className="space-y-3 mb-6">
          {/* Theme Toggle */}
          <Card className="cursor-pointer" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    {theme === "dark" ? (
                      <Moon className="w-5 h-5 text-primary" />
                    ) : (
                      <Sun className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">ธีม</p>
                    <p className="text-sm text-muted-foreground">
                      {theme === "dark" ? "โหมดมืด" : "โหมดสว่าง"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium">ความปลอดภัย</p>
                  <p className="text-sm text-muted-foreground">ข้อมูลของคุณปลอดภัยด้วยการเข้ารหัส</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* App Info */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">Money Summary v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">© 2024 All rights reserved</p>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          ออกจากระบบ
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
