"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import Head from "next/head";

export default function OfflinePage() {
  return (
    <>
      <Head>
        <title>Offline - Money Summary</title>
        <meta name="description" content="คุณออฟไลน์อยู่" />
      </Head>
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">คุณออฟไลน์อยู่</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            ดูเหมือนว่าคุณจะไม่ได้เชื่อมต่ออินเทอร์เน็ต
            กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              ลองใหม่
            </Button>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                หน้าแรก
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t text-sm text-muted-foreground">
            <p>คุณสามารถใช้งานแอปได้ตามปกติเมื่อกลับมออนไลน์</p>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
