# Money Summary - ระบบบันทึกรายรับรายจ่าย

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748)](https://www.prisma.io/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E699)](https://neon.tech/)

Progressive Web App (PWA) สำหรับบันทึกรายรับรายจ่ายส่วนตัว พร้อม Dashboard และ Analytics

## ✨ ฟีเจอร์หลัก

- 🔐 **Login ด้วย Google OAuth** - ปลอดภัย ไม่ต้องจำรหัสผ่าน
- 💰 **จัดการรายรับรายจ่าย** - CRUD ครบถ้วน พร้อมการค้นหาและกรอง
- 🏷️ **หมวดหมู่ที่กำหนดเอง** - สร้างหมวดหมู่รายรับ/รายจ่าย พร้อมเลือกสี
- 📊 **Dashboard Analytics** - กราฟ Pie Chart และ Line Chart
- 💵 **ตั้งงบประมาณรายเดือน** - แจ้งเตือนเมื่อใกล้เกินงบ
- 📱 **PWA Support** - ติดตั้งบนมือถือได้ (iOS/Android)
  - ✅ รองรับการทำงานแบบ Offline
  - ✅ มีหน้า Offline Fallback
  - ✅ Push Notification พร้อมใช้
  - ✅ ไอคอน Adaptive สำหรับ Android
  - ✅ ติดตั้งผ่าน Browser ได้ทันที
- 🌙 **Dark Mode** - ธีมมืดเริ่มต้น พร้อมรองรับ Light Mode

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| UI Components | Radix UI, Shadcn UI |
| Charts | Recharts |
| Backend | Next.js Route Handlers |
| ORM | Prisma |
| Database | Neon PostgreSQL (Serverless) |
| Auth | NextAuth.js v5 (Auth.js) |
| PWA | next-pwa |
| Testing | Vitest |

## 🚀 การติดตั้ง

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd money-summary
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

```bash
cp .env.example .env.local
```

แก้ไขไฟล์ `.env.local`:

```env
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://username:password@ep-xxx-xxx-pooler.us-east-1.aws.neon.tech/database_name?sslmode=require"

# NextAuth.js
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio
npx prisma studio
```

### 5. รัน Development Server

```bash
npm run dev
```

เปิด browser ที่ `http://localhost:3000`

## 📱 PWA (Progressive Web App)

Money Summary รองรับการทำงานแบบ PWA อย่างเต็มรูปแบบ:

### ฟีเจอร์ PWA

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| **Offline Support** | ใช้งานได้แม้ไม่มีอินเทอร์เน็ต พร้อมหน้า Fallback |
| **Service Worker** | จัดการ Cache อัตโนมัติด้วย Workbox |
| **Install Prompt** | แสดงป๊อปอัปชวนติดตั้งบน Android/Chrome |
| **Adaptive Icons** | ไอคอนปรับเปลี่ยนรูปทรงตามระบบ (Android) |
| **App Shortcuts** | เข้าถึงหน้าหลักได้จากไอคอน (Android) |
| **Push Ready** | รองรับ Push Notification ในอนาคต |

### การติดตั้งบนอุปกรณ์

#### Android (Chrome)
1. เปิดเว็บไซต์ใน Chrome
2. แตะปุ่ม "เพิ่มลงในหน้าจอหลัก" หรือ "Install"
3. ยืนยันการติดตั้ง

#### iOS (Safari)
1. เปิดเว็บไซต์ใน Safari
2. แตะปุ่มแชร์ (Share)
3. เลื่อนลงและแตะ "เพิ่มลงหน้าจอโฮม" (Add to Home Screen)

#### Desktop (Chrome/Edge)
1. เปิดเว็บไซต์ใน Chrome หรือ Edge
2. คลิกไอคอน Install ที่แถบที่อยู่ หรือในเมนู

### ไฟล์ PWA

```
public/
├── manifest.json          # Web App Manifest
├── sw.js                  # Service Worker (Auto-generated)
├── browserconfig.xml      # Microsoft Edge Config
└── icons/
    ├── icon-72x72.png     # Favicon ขนาดเล็ก
    ├── icon-192x192.png   # Android/Chrome Icon
    ├── icon-512x512.png   # Splash Screen
    ├── maskable-icon.png  # Adaptive Icon (Android)
    └── icon.svg           # Vector Icon
```

### การสร้างไอคอนใหม่

หากต้องการสร้างไอคอนใหม่:

```bash
# สร้าง SVG icons
node scripts/generate-icons.js

# แปลงเป็น PNG
node scripts/svg-to-png.js
```

## 🌐 การ Deploy บน Vercel

### Step 1: สมัครและตั้งค่า Neon Database

1. ไปที่ [neon.tech](https://neon.tech) สมัครสมาชิก
2. สร้าง Project ใหม่
3. สร้าง Database
4. ไปที่ Settings → Connection String
5. เลือก **Pooled connection** (สำคัญสำหรับ Serverless)
6. คัดลอก Connection String

### Step 2: สร้าง Google OAuth Credentials

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่
3. ไปที่ APIs & Services → Credentials
4. กด Create Credentials → OAuth client ID
5. Configure consent screen:
   - User Type: External
   - App name: Money Summary
   - User support email: อีเมลของคุณ
   - Developer contact: อีเมลของคุณ
6. Create OAuth client ID:
   - Application type: Web application
   - Name: Money Summary Web
   - Authorized JavaScript origins: `https://your-app.vercel.app`
   - Authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`
7. บันทึก Client ID และ Client Secret

### Step 3: Deploy บน Vercel

1. ไปที่ [vercel.com](https://vercel.com) สมัครสมาชิก
2. กด Add New Project
3. Import Git Repository
4. Configure Project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 4: ตั้งค่า Environment Variables บน Vercel

ไปที่ Project Settings → Environment Variables เพิ่ม:

```
DATABASE_URL=<your-neon-pooled-connection-string>
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=https://your-app.vercel.app
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

**สร้าง NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 5: Run Migration บน Production

```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Login
vercel login

# Pull environment variables
vercel env pull .env.production.local

# Run migration
npx prisma migrate deploy
```

หรือใช้ Vercel Console:
1. ไปที่ Project → Settings → Git
2. ใน Build & Development Settings
3. แก้ไข Build Command เป็น:
   ```bash
   npx prisma migrate deploy && next build
   ```

### Step 6: Redeploy

```bash
vercel --prod
```

หรือกด Deploy ใหม่ใน Vercel Dashboard

## 📁 โครงสร้างโปรเจค

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   ├── budgets/          # Budgets API
│   │   ├── categories/       # Categories API
│   │   ├── summary/          # Dashboard summary API
│   │   └── transactions/     # Transactions API
│   ├── budgets/              # Budgets page
│   ├── categories/           # Categories page
│   ├── dashboard/            # Dashboard page
│   ├── settings/             # Settings page
│   ├── transactions/         # Transactions page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── bottom-nav.tsx        # Bottom navigation
│   ├── theme-provider.tsx    # Theme provider
│   └── toaster.tsx           # Toast notifications
├── hooks/                    # Custom React hooks
│   └── use-toast.ts          # Toast hook
├── lib/                      # Utilities
│   ├── auth.ts               # NextAuth config
│   ├── prisma.ts             # Prisma client (serverless-safe)
│   ├── utils.ts              # Utility functions
│   └── validations.ts        # Zod schemas
├── services/                 # Business logic
│   └── summary.service.ts    # Dashboard calculations
├── types/                    # TypeScript types
│   └── index.ts              # Type definitions
└── middleware.ts             # Next.js middleware

prisma/
└── schema.prisma             # Database schema

public/
├── manifest.json             # PWA manifest
└── icons/                    # App icons
```

## 🧪 การรัน Tests

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📱 การติดตั้ง PWA

### iOS (Safari)
1. เปิดเว็บไซต์ใน Safari
2. กดปุ่ม Share (สี่เหลี่ยมลูกศรขึ้น)
3. เลื่อนลงและกด "Add to Home Screen"
4. กด "Add"

### Android (Chrome)
1. เปิดเว็บไซต์ใน Chrome
2. กดปุ่ม Menu (สามจุด)
3. เลือก "Add to Home screen"
4. กด "Add"

## 🔒 ความปลอดภัย

- Authentication ด้วย JWT + Google OAuth
- Middleware ป้องกัน route ที่ต้องการ authentication
- SQL Injection protection ผ่าน Prisma ORM
- XSS protection ผ่าน Next.js

## 📝 License

MIT License

## 🤝 การมีส่วนร่วม

ยินดีรับ Pull Request สำหรับการปรับปรุงและแก้ไข bugs

## 📧 ติดต่อ

หากมีปัญหาหรือข้อสงสัย สามารถเปิด Issue ได้ที่ GitHub Repository
