# Clique Dating App - Frontend 💖

> A modern dating application built with React, TypeScript, and Vite for Clique83.com technical assessment.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://clique-fe.vercel.app)
[![Backend API](https://img.shields.io/badge/API-active-blue)](https://clique-pro.onrender.com/api)

## 📱 Demo

- **Frontend**: [https://clique-fe.vercel.app](https://clique-fe.vercel.app)
- **Backend API**: [https://clique-pro.onrender.com/api](https://clique-pro.onrender.com/api)
- **API Docs**: [https://clique-pro.onrender.com/api](https://clique-pro.onrender.com/api) (Swagger)

## ✨ Features

### 👤 Profile Management
- ✅ Create and manage user profiles
- ✅ View profile details (name, age, gender, bio)
- ✅ Update and delete profiles
- ✅ Select "current user" for testing

### 💙 Like System
- ✅ Browse and like other profiles
- ✅ View sent and received likes
- ✅ Real-time like notifications

### 💑 Matching
- ✅ Automatic match creation when both users like each other
- ✅ View all matches with match details
- ✅ Match timeline and history

### 📅 Availability Scheduling
- ✅ Set availability for meetings
- ✅ Choose day of week and time slots
- ✅ Find mutual availability with matches
- ✅ Manage and delete availability

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **State Management**: React Hooks
- **HTTP Client**: Fetch API
- **Routing**: React Router v6
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see [clique-pro](../clique-pro))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd clique-fe

# Install dependencies
npm install

# Start development server
npm run dev
```

App will be available at: `http://localhost:5173`

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api  # Local backend
# or
VITE_API_URL=https://clique-pro.onrender.com/api  # Production
```

## 📁 Project Structure

```
clique-fe/
├── src/
│   ├── components/      # Reusable UI components
│   │   └── ui/         # shadcn/ui components
│   ├── pages/          # Page components
│   │   ├── ProfilesPage.tsx
│   │   ├── LikePage.tsx
│   │   ├── MatchesPage.tsx
│   │   └── AvailabilityPage.tsx
│   ├── lib/            # Utilities
│   ├── assets/         # Static assets
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── public/             # Public assets
├── index.html          # HTML template
└── vite.config.ts      # Vite configuration
```

## 📖 Usage Guide

### 1. Create Profiles
1. Go to `/profiles`
2. Click "Tạo Profile Mới" (Create New Profile)
3. Fill in: name, email, age, gender, bio
4. Submit form

### 2. Select Current User
1. In profiles list, find your profile
2. Click "Use as Me" button
3. This sets you as the active user for testing

### 3. Like Other Profiles
1. Go to `/like`
2. Browse available profiles
3. Click "Like" on profiles you're interested in
4. View sent/received likes

### 4. View Matches
1. Go to `/matches`
2. When both users like each other, a match is created
3. View match details and mutual information

### 5. Set Availability
1. Go to `/matches`
2. Click "Set Availability" on a match
3. Select day of week (Monday-Sunday)
4. Choose time slot (Morning, Afternoon, Evening, Night)
5. Find mutual availability with your match

## 🎨 UI Components

Using [shadcn/ui](https://ui.shadcn.com/) components:
- Button, Card, Input, Select
- Dialog, Alert, Badge
- Table, Tabs, Toast

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

Output in `dist/` folder.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect GitHub repo to Vercel for auto-deployment.

### Important: SPA Routing

The `vercel.json` file ensures all routes redirect to `index.html` for client-side routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting (optional)

## 🐛 Troubleshooting

### Issue: 404 on page reload
**Solution**: Ensure `vercel.json` exists with rewrites configuration.

### Issue: API connection fails
**Solution**: Check `VITE_API_URL` in `.env` and ensure backend is running.

### Issue: CORS errors
**Solution**: Backend must allow frontend origin in CORS config.

## 🤝 Contributing

This is a technical assessment project for Clique83.com.

## 📄 License

MIT

## 👨‍💻 Author

Built for Clique83.com Web Developer Intern position.
