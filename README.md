# Clique Mini Dating App 🎯

> Bài test kỹ thuật cho vị trí **Web Developer Intern** tại Clique83.com

---

## 📌 Giới thiệu

Mini Dating App là một ứng dụng hẹn hò đơn giản được xây dựng để hoàn thành bài test kỹ thuật. Ứng dụng cho phép người dùng:

- Tạo profile cá nhân
- Like các profile khác
- Tự động match khi cả hai cùng like nhau
- Đặt lịch hẹn bằng cách tìm thời gian trống chung

---

## 🛠️ Tech Stack

### Backend

- **NestJS 11.x** - Framework Node.js hiện đại với TypeScript
- **Prisma ORM** - Type-safe database client
- **SQLite** - Database đơn giản, dễ setup
- **Zod** - Schema validation cho request/response
- **TypeScript** - Type safety cho toàn bộ backend

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool nhanh
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Component library (Button, Card, Dialog, Input...)
- **Sonner** - Toast notifications
- **React Router** - Client-side routing
- **Axios** - HTTP client

---

## 🚀 Cài đặt & Chạy Project

### 1. Clone repository

```bash
git clone <repo-url>
cd TIGER
```

### 2. Backend Setup

```bash
cd clique-pro
pnpm install

# Tạo file .env
cp .env.example .env

# Chạy migrations
pnpm prisma migrate dev

# Khởi động server
pnpm start:dev
```

Backend sẽ chạy tại: **http://localhost:3000**

### 3. Frontend Setup

```bash
cd clique-fe
npm install

# Khởi động dev server
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

### 4. (Optional) Xem Database

```bash
cd clique-pro
pnpm prisma studio
```

Prisma Studio sẽ mở tại: **http://localhost:5555**

---

## 📖 Hướng dẫn sử dụng

### Bước 1: Tạo Profiles

1. Vào trang **Profiles** (`/profiles`)
2. Click **"Tạo Profile Mới"**
3. Điền thông tin:
   - Tên
   - Tuổi (18-99)
   - Giới tính (Male/Female/Other)
   - Bio
   - Email
4. Click **"Tạo Profile"**

### Bước 2: Chọn User

1. Trên danh sách profiles
2. Click **"Use as Me"** trên profile bạn muốn sử dụng
3. Profile được lưu vào localStorage

### Bước 3: Like Profiles

1. Vào trang **Like** (`/like`)
2. Hệ thống hiển thị các profile khác (không bao gồm bạn)
3. Click **"Like"** trên profile bạn thích

### Bước 4: Xem Matches

1. Vào trang **Matches** (`/matches`)
2. Khi cả 2 user like nhau → Match tự động xuất hiện
3. Match hiển thị 4 trạng thái:
   - ✅ **Scheduled** - Đã tìm được lịch chung
   - ⚠️ **No common time** - Cả 2 đã set lịch nhưng không trùng
   - 📅 **Waiting for other** - Bạn đã set, đang đợi người kia
   - 🕐 **Not set** - Chưa ai set lịch

### Bước 5: Set Availability

1. Trên Match card, click **"Set Availability"**
2. Xem lịch đã set trước đó (nếu có)
3. Thêm khung giờ mới:
   - Chọn **Start Time** (trong 3 tuần tới)
   - Chọn **End Time** (sau start time ít nhất 1 giờ)
4. Click **"Add Another Time Slot"** để thêm nhiều khung giờ
5. Click **"Save Availability"**

### Bước 6: Kết quả

- Nếu có thời gian trùng → Toast thông báo **"🎉 Date scheduled!"**
- Nếu không trùng → Hiển thị warning card trên matches page

---

## 🏗️ Kiến trúc hệ thống

### Backend Architecture

```
clique-pro/
├── src/
│   ├── routes/
│   │   ├── profiles/
│   │   │   ├── profiles.controller.ts    # REST endpoints
│   │   │   ├── profiles.service.ts       # Business logic
│   │   │   ├── profiles.repository.ts    # Database operations
│   │   │   ├── profiles.model.ts         # Zod schemas
│   │   │   └── profiles.dto.ts           # DTOs
│   │   ├── likes/                        # Tương tự profiles
│   │   ├── matches/                      # Tương tự profiles
│   │   └── availability/                 # Tương tự profiles
│   ├── prisma/
│   │   └── prisma.service.ts             # Prisma client wrapper
│   └── app.module.ts                     # Root module
├── prisma/
│   ├── schema.prisma                     # Database schema
│   └── migrations/                       # Migration history
└── prisma.db                             # SQLite database file
```

**Pattern sử dụng:** Controller → Service → Repository

### Frontend Architecture

```
clique-fe/
├── src/
│   ├── pages/
│   │   ├── ProfilesPage.tsx              # CRUD profiles
│   │   ├── LikePage.tsx                  # Like profiles
│   │   ├── MatchesPage.tsx               # View matches
│   │   └── SchedulingPage.tsx            # Set availability
│   ├── components/
│   │   └── ui/                           # shadcn components
│   ├── lib/
│   │   ├── api.ts                        # API client + types
│   │   └── useCurrentUser.ts             # localStorage hook
│   └── App.tsx                           # Router config
```

---

## 💾 Lưu trữ dữ liệu

### Backend - Database (SQLite + Prisma)

**Schema:**

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  age       Int
  gender    String
  bio       String
  email     String   @unique
  createdAt DateTime @default(now())
}

model Like {
  id         String   @id @default(uuid())
  fromUserId String   # User thực hiện like
  toUserId   String   # User được like
  createdAt  DateTime @default(now())

  @@unique([fromUserId, toUserId])  # Ngăn duplicate likes
}

model Match {
  id          String   @id @default(uuid())
  userAId     String   # User 1
  userBId     String   # User 2
  scheduledAt DateTime? # Thời gian hẹn (nếu đã tìm được)
  createdAt   DateTime @default(now())

  @@unique([userAId, userBId])  # Ngăn duplicate matches
}

model Availability {
  id        String   @id @default(uuid())
  userId    String   # User set lịch
  matchId   String   # Match này
  date      DateTime # Ngày hẹn
  startTime String   # Giờ bắt đầu (HH:mm)
  endTime   String   # Giờ kết thúc (HH:mm)
  createdAt DateTime @default(now())
}
```

### Frontend - localStorage

```typescript
// Key: "currentUserId"
// Value: UUID của user đang được chọn
localStorage.setItem("currentUserId", "uuid-here");
```

---

## ⚙️ Logic Match

### 1. Luồng Like

```typescript
// User A like User B
POST /api/likes
{
  "fromUserId": "A",
  "toUserId": "B"
}

// Backend check:
1. Tạo Like record (A → B)
2. Kiểm tra đã có Like ngược lại chưa (B → A)?
   - Nếu CÓ → Tạo Match tự động
   - Nếu CHƯA → Chỉ lưu Like
```

### 2. Logic tạo Match tự động

**File:** `clique-pro/src/routes/likes/likes.service.ts`

```typescript
async createLike(data: CreateLikeDto) {
  // 1. Tạo like record
  const like = await this.likesRepository.createLike(data);

  // 2. Check reverse like
  const reverseLike = await this.likesRepository.findLike(
    data.toUserId,
    data.fromUserId
  );

  // 3. Nếu có reverse like → Tạo match
  if (reverseLike) {
    await this.matchesRepository.createMatch({
      userAId: data.fromUserId,
      userBId: data.toUserId,
    });
    return { message: "It's a Match! 🎉", matched: true };
  }

  return { message: "Like created", matched: false };
}
```

### 3. Đảm bảo unique matches

- Sử dụng `@@unique([userAId, userBId])` trong Prisma schema
- Backend luôn sort `userAId < userBId` để tránh duplicate (A-B và B-A)

---

## 🕐 Logic tìm slot trùng

### Thuật toán: First Common Slot

**File:** `clique-pro/src/routes/availability/availability.repository.ts`

```typescript
async findCommonSlot(matchId: string) {
  // 1. Lấy TẤT CẢ availabilities của match này
  const slots = await prisma.availability.findMany({
    where: { matchId },
    orderBy: { date: 'asc' },  // Sort theo thời gian
  });

  // 2. Group theo userId
  const userASlots = slots.filter(s => s.userId === userAId);
  const userBSlots = slots.filter(s => s.userId === userBId);

  // 3. Tìm slot trùng nhau (same date + overlapping time)
  for (const slotA of userASlots) {
    for (const slotB of userBSlots) {
      if (isSameDay(slotA.date, slotB.date)) {
        // Check time overlap
        const overlap = findTimeOverlap(
          slotA.startTime, slotA.endTime,
          slotB.startTime, slotB.endTime
        );

        if (overlap) {
          return {
            date: slotA.date,
            startTime: overlap.start,
            endTime: overlap.end
          };
        }
      }
    }
  }

  return null;  // Không có slot trùng
}
```

### Ví dụ minh họa

**User A set:**

- 2026-02-25: 14:00 - 16:00
- 2026-02-26: 10:00 - 12:00

**User B set:**

- 2026-02-25: 15:00 - 17:00
- 2026-02-26: 13:00 - 15:00

**Kết quả:**

- ✅ Ngày 25/2: Trùng từ 15:00 - 16:00 → **ĐÂY LÀ SLOT CHỌN**
- ❌ Ngày 26/2: Không trùng

---

## ✨ Tính năng điểm cộng đã implement

### 1. ✅ Validation nâng cao

- End time phải sau start time
- Mỗi slot tối thiểu 1 giờ
- Không cho set quá khứ
- Chỉ cho set trong 3 tuần tới
- Detect overlapping time slots của cùng user
- Min/max constraints trên datetime input

### 2. ✅ Toast Notifications (Sonner)

- Thay thế `alert()` và inline messages
- Success, error, loading states
- Position: top-center
- Auto dismiss sau 3-4 giây

### 3. ✅ Loading States đầy đủ

- Loading khi validate match access
- Loading khi load availabilities
- Loading khi submit form
- Loading spinner trên nút Delete
- Text khác nhau cho từng loading state

### 4. ✅ Xử lý Edge Cases

- Validate user belongs to match (không thể access match của người khác)
- Auto redirect nếu match không tồn tại
- Handle khi không có currentUserId
- Better error messages với context
- Prevent duplicate submissions

### 5. ✅ Tối ưu UX

- Sort availabilities theo thời gian
- Color-coded availability sections (blue/purple)
- 4 trạng thái match rõ ràng
- Explanation card về cách scheduling hoạt động
- Custom Dialog thay browser confirm()
- Delete confirmation với loading feedback

### 6. ✅ Code Quality

- TypeScript strict mode
- Zod validation cho tất cả API endpoints
- Repository pattern (separation of concerns)
- Proper error handling
- Clean component structure

---

## 🔮 Nếu có thêm thời gian

### 1. Upload & Crop Avatar

**Tại sao:** Dating app cần hình ảnh để tăng tương tác
**Công nghệ:**

- Multer (upload)
- Sharp (resize/crop)
- Cloudinary (storage)

### 2. Real-time Chat sau khi Match

**Tại sao:** Tăng engagement sau khi match
**Công nghệ:**

- Socket.io hoặc Firebase Realtime Database
- Message history với Prisma

### 3. Location-based Matching

**Tại sao:** Tăng khả năng gặp IRL
**Công nghệ:**

- Geolocation API
- PostGIS hoặc MongoDB với geo queries
- Filter matches theo bán kính (5km, 10km...)

### 4. Authentication & Security

**Tại sao:** Production-ready
**Công nghệ:**

- JWT hoặc Session-based auth
- Bcrypt password hashing
- Email verification
- Rate limiting

### 5. Advanced Filters

**Tại sao:** Cải thiện match quality
**Features:**

- Age range
- Gender preference
- Distance
- Interests/hobbies

### 6. Notification System

**Tại sao:** Re-engagement
**Loại notifications:**

- New match
- Date scheduled
- New message
- Profile viewed

---

## 💡 Đề xuất 3 tính năng mới

### 1. **"Icebreaker Questions" - Câu hỏi phá băng** 🎯

**Mô tả:**
Khi match thành công, hệ thống gợi ý 3-5 câu hỏi phá băng để 2 người dễ bắt chuyện hơn.

**Ví dụ câu hỏi:**

- "Nếu được du lịch 1 nơi, bạn chọn đâu?"
- "Món ăn yêu thích của bạn là gì?"
- "Sở thích cuối tuần của bạn?"

**Tại sao cần:**

- **Giảm awkwardness:** Nhiều người không biết bắt đầu cuộc trò chuyện
- **Tăng engagement:** Có topic sẵn để nói
- **Personalization:** Câu hỏi có thể dựa trên profile (age, interests)

**Cách implement:**

- Lưu câu hỏi trong database
- Random 3-5 câu khi match
- Display ở Match card hoặc Chat page

---

### 2. **"Date Idea Suggestions" - Gợi ý địa điểm hẹn** 📍

**Mô tả:**
Sau khi hệ thống tìm được slot trùng, suggest 2-3 địa điểm hẹn phù hợp (quán cà phê, nhà hàng, công viên...).

**Features:**

- Tích hợp Google Places API
- Filter theo location (gần trung tâm thành phố)
- Hiển thị rating, giá, khoảng cách
- User có thể chọn hoặc suggest địa điểm riêng

**Tại sao cần:**

- **Decision fatigue:** Giảm khó khăn trong việc chọn địa điểm
- **Local discovery:** Giới thiệu địa điểm mới
- **Better UX:** End-to-end experience từ match → scheduled → location

**Cách implement:**

- Google Places API integration
- Lưu địa điểm đã chọn trong Match model
- Map integration để xem location

---

### 3. **"Safety Features" - Tính năng an toàn** 🛡️

**Mô tả:**
Tính năng để người dùng cảm thấy an toàn hơn khi hẹn hò với người lạ.

**Features:**

- **Share Date Info:** Chia sẻ thông tin cuộc hẹn với bạn bè (date, time, location)
- **Check-in Feature:** Button "I'm safe" để confirm sau cuộc hẹn
- **Report & Block:** Report inappropriate behavior
- **Profile Verification:** Badge xác minh danh tính (qua phone/email/ID)

**Tại sao cần:**

- **Trust & Safety:** Ưu tiên hàng đầu trong dating apps
- **Đặc biệt quan trọng cho phụ nữ:** Cảm giác an toàn khi gặp người lạ
- **Compliance:** Chuẩn bị cho các regulations về online safety
- **Brand reputation:** Thể hiện trách nhiệm của platform

**Cách implement:**

- SMS/Email notification cho emergency contact
- In-app "Panic button" (optional)
- Verification qua Twilio (SMS) hoặc third-party KYC service
- Moderation system cho reports

---

## 📊 Metrics & Analytics (Bonus idea)

Nếu product đi vào production, cần track:

- **Match rate:** % users get matched
- **Date completion rate:** % scheduled dates actually happen
- **User retention:** D1, D7, D30 retention
- **Time to first match:** Average time
- **Peak activity hours:** Để optimize notifications

---

## 🐛 Known Limitations

1. **Không có authentication:** Ai cũng có thể "Use as Me" bất kỳ profile nào
2. **Không có image upload:** Profile không có avatar
3. **Single timezone:** Không xử lý timezone khác nhau
4. **No pagination:** Load tất cả data (không scale với nhiều users)
5. **SQLite:** Không phù hợp production (nên dùng PostgreSQL)

---

## 🧪 Testing

### Manual Testing Checklist

**Profiles:**

- [x] Tạo profile mới với đầy đủ thông tin
- [x] Validation: Không cho age < 18 hoặc > 99
- [x] Validation: Email format
- [x] Edit profile
- [x] Delete profile
- [x] "Use as Me" functionality

**Likes:**

- [x] Like một profile
- [x] Không thể like chính mình
- [x] Auto match khi cả 2 like nhau

**Matches:**

- [x] Hiển thị đúng danh sách matches
- [x] 4 trạng thái: scheduled, no overlap, waiting, not set
- [x] Color coding cho availability sections

**Scheduling:**

- [x] Set multiple time slots
- [x] Validation: End time > Start time
- [x] Validation: Minimum 1 hour duration
- [x] Validation: Không cho set quá khứ
- [x] Validation: Only 3 weeks ahead
- [x] Detect overlapping slots
- [x] Delete availability
- [x] Find common slot algorithm

---

## 📝 Kết luận

Project này demonstrate:

- ✅ **Full-stack development:** Backend + Frontend + Database
- ✅ **Modern tech stack:** NestJS, React, TypeScript, Prisma
- ✅ **Clean architecture:** Repository pattern, separation of concerns
- ✅ **UX attention:** Loading states, validations, error handling
- ✅ **Production mindset:** Edge cases, security considerations
- ✅ **AI utilization:** Sử dụng AI để tăng tốc development

Cảm ơn đã xem! 🙏

---

## 📞 Contact

**Candidate:** [Your Name]  
**Email:** [Your Email]  
**GitHub:** [Your GitHub]  
**Demo:** [Vercel/Netlify Link]

---

**Note:** Bài test này được hoàn thành với sự hỗ trợ của GitHub Copilot và Claude AI theo đúng hướng dẫn của Clique83.com.
