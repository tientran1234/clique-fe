# Clique Mini Dating App - Frontend 💖

> Mini Dating App được xây dựng cho bài test kỹ thuật vị trí Web Developer Intern tại Clique83.com

## 🔗 Live Demo

- **Frontend**: https://clique-fe.vercel.app
- **Backend API**: https://clique-pro.onrender.com/api

## 🛠️ Công nghệ sử dụng

- **React 18** + TypeScript
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Navigation
- **React Hook Form + Zod** - Form validation

## 🚀 Cài đặt nhanh

```bash
# Cài đặt dependencies
npm install

# Setup môi trường
cp .env.example .env
# Chỉnh sửa VITE_API_URL để trỏ đến backend

# Chạy development
npm run dev
```

Ứng dụng chạy tại: http://localhost:5173

## ✅ Tính năng đã hoàn thành

### Phần A - Quản lý Profile ✅

- Tạo profile với tên, tuổi, giới tính, bio, email
- CRUD đầy đủ (Create, Read, Update, Delete)
- Form validation với Zod
- Tìm kiếm và lọc profiles

### Phần B - Hệ thống Like & Match ✅

- Xem và like profiles
- Tự động tạo match khi cả 2 người like nhau
- Hiển thị thông báo "It's a Match"
- Xem tất cả matches

### Phần C - Đặt lịch hẹn ✅

- Chọn khung giờ rảnh trong 3 tuần tới
- Nhiều khung giờ cho mỗi match
- Tự động phát hiện khung giờ trùng đầu tiên
- Hiển thị ngày hẹn hoặc thông báo "Không có khung giờ trùng"

## 📁 Cấu trúc dự án

```
clique-fe/
├── src/
│   ├── components/ui/    # shadcn/ui components
│   ├── pages/            # Các page components
│   │   ├── ProfileList.tsx
│   │   ├── ProfileForm.tsx
│   │   ├── LikePage.tsx
│   │   ├── MatchesPage.tsx
│   │   └── SchedulingPage.tsx
│   ├── lib/
│   │   ├── api.ts        # API client & types
│   │   └── utils.ts
│   └── App.tsx
└── package.json
```

## 🎯 Tính năng bổ sung

- ✅ **Lọc nâng cao**: Lọc theo giới tính, độ tuổi, tìm kiếm theo tên/email
- ✅ **Sắp xếp**: Sắp xếp profiles theo ngày tạo, tên hoặc tuổi
- ✅ **Statistics Dashboard**: Thống kê phân bố giới tính
- ✅ **Validation thời gian thực**: Phản hồi form ngay lập tức
- ✅ **Toast Notifications**: Thông báo lỗi/thành công thân thiện
- ✅ **Loading States**: Hiển thị loading cho tất cả async operations
- ✅ **Responsive Design**: Hoạt động trên mobile và desktop
- ✅ **Xử lý Edge Cases**: Xử lý khung giờ trùng, ngày quá khứ, validation

## 📖 Chi tiết triển khai

### 1. Tổ chức hệ thống

- **Pages**: Mỗi tính năng là một page component riêng (ProfileList, LikePage, MatchesPage, SchedulingPage)
- **API Layer**: API client tập trung trong `lib/api.ts` với TypeScript types
- **Components**: Các UI components tái sử dụng từ shadcn/ui
- **State**: Local state với React hooks, currentUser trong localStorage

### 2. Lưu trữ dữ liệu

- **Backend**: Tất cả dữ liệu được lưu trong PostgreSQL qua REST API
- **Local**: Chỉ "currentUserId" được lưu trong localStorage để test
- **Không dùng local storage** cho profiles, likes, matches - tất cả qua API calls

### 3. Logic Match (Frontend View)

```typescript
// Khi user click nút "Like":
1. POST /api/likes → Backend tạo Like record
2. Backend kiểm tra nếu receiver đã like sender
3. Nếu có mutual like → Backend tự động tạo Match
4. Response trả về { isMatch: true, matchId: "..." }
5. Frontend hiển thị "🎉 It's a Match!" và chuyển đến /matches
```

### 4. Logic tìm slot trùng (Frontend View)

```typescript
// Khi cả 2 users set availability:
1. POST /api/availability với các khung giờ của user
2. Backend so sánh tất cả slots từ cả 2 users
3. Tìm slot trùng đầu tiên (cùng ngày + giờ trùng nhau)
4. Trả về { commonSlot: { date, time }, message: "..." }
5. Frontend hiển thị: "Lịch hẹn: [ngày] lúc [giờ]"
6. Nếu không trùng: Hiển thị "Không tìm thấy khung giờ chung"
```

### 5. Cải thiện trong tương lai

Nếu có thêm thời gian, em sẽ thêm:

- **WebSocket/SSE**: Thông báo thời gian thực cho likes và matches mới
- **Upload ảnh**: Ảnh profile với Cloudinary/S3
- **Hệ thống Chat**: Nhắn tin trong app cho matched users
- **Matching nâng cao**: Thuật toán dựa trên sở thích, vị trí
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright cho các user flows quan trọng

### 6. Đề xuất tính năng cho sản phẩm

#### 1. **Video giới thiệu (30-60s)**

**Lý do**: Bio văn bản có thể gây hiểu nhầm. Video thể hiện tính cách thật, giọng nói và năng lượng. Tăng độ tin cậy và giảm tình trạng giả mạo. Tương tự như video profiles của Bumble.

#### 2. **Interest Tags & Điểm tương thích**

**Lý do**: Cho phép users gắn tags sở thích (âm nhạc, thể thao, ăn uống, du lịch). Hiển thị điểm tương thích trên profiles. Giúp tìm matches phù hợp hơn ngoài việc chỉ nhìn ảnh.

#### 3. **Tính năng an toàn (Report, Block, Xác minh Video)**

**Lý do**: Thiết yếu cho sự an toàn của người dùng. Xác minh video selfie giảm fake profiles. Tính năng report/block bảo vệ khỏi quấy rối. Xây dựng lòng tin trong cộng đồng.

## 📝 Ghi chú

- Không có hệ thống authentication (theo yêu cầu - tập trung vào core features)
- Nút "Use as Me" mô phỏng việc chọn user để test
- Tất cả dữ liệu lưu trữ qua backend database
- Validation và error handling production-ready

## 🤝 Liên hệ

Nếu có câu hỏi về implementation, vui lòng xem code comments hoặc liên hệ với em.

---

Built with ❤️ cho Clique83.com Technical Assessment
