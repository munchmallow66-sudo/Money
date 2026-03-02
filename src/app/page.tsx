import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Wallet, TrendingUp, PieChart, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LoginButton } from "./login-button";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Money Summary
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            บริหารจัดการการเงินส่วนตัวของคุณได้อย่างง่ายดาย 
            บันทึกรายรับรายจ่าย ตั้งงบประมาณ และติดตามแนวโน้มการใช้จ่าย
          </p>

          <LoginButton />

          <p className="mt-4 text-sm text-muted-foreground">
            ฟรีตลอดชีพ · ไม่มีโฆษณา · ปลอดภัยด้วยการเข้ารหัส
          </p>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="font-semibold mb-2">ติดตามรายรับรายจ่าย</h3>
              <p className="text-sm text-muted-foreground">
                บันทึกและติดตามทุกธุรกรรมการเงินของคุณแบบ real-time
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">วิเคราะห์ด้วยกราฟ</h3>
              <p className="text-sm text-muted-foreground">
                ดูภาพรวมการใช้จ่ายผ่านกราฟและแผนภูมิที่เข้าใจง่าย
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">ตั้งงบประมาณ</h3>
              <p className="text-sm text-muted-foreground">
                กำหนดงบประมาณรายเดือนและรับการแจ้งเตือนเมื่อใกล้เกินงบ
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="font-semibold mb-2">ปลอดภัย</h3>
              <p className="text-sm text-muted-foreground">
                ข้อมูลของคุณปลอดภัยด้วยการเข้ารหัสและการยืนยันตัวตน
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Money Summary. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
