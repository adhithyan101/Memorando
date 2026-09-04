# Memorando 🌅 — Personal Digital Memory Companion

> *"Every screen should feel like opening an old photo album during golden hour."*

[![React](https://img.shields.io/badge/React-18.3-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg?logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12-orange.svg?logo=firebase)](https://firebase.google.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-blueviolet.svg?logo=cloudinary)](https://cloudinary.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Memorando** is a private, emotional digital memory companion designed to preserve meaningful life moments with loved ones. Built with a mobile-first responsive architecture and a "Golden Memories" aesthetic, Memorando connects directly to real backend services (**Firebase Auth**, **Cloud Firestore**, **Cloudinary**, and **Google Gemini AI**) with **zero mock data**.

---

## ✨ Features

- 👥 **Person → Memories Core**: Group memories around the special people in your life with customizable relationship badges, birthdays, and individual memory books.
- 📖 **Chronological Memory Timeline**: Filter memories by year, month, mood, or linked person.
- 🎙️ **Voice Notes & Media**: Direct Web Audio recording and photo/video gallery upload powered by Cloudinary.
- ⏳ **Time Capsules**: Time-locked memories that remain sealed until a specified unlock date.
- ✉️ **Future Letters**: Write heartfelt letters to your future self or loved ones with automated unlock checks.
- 🌌 **On This Day**: Revisit moments created on today's date in past years.
- 🤖 **Gemini AI Companion**: Narrative story generation and cinematic movie scene breakdowns powered by `@google/generative-ai`.
- 🎨 **Golden Memories Palette**: Warm Ivory (`#FFF8F2`), Soft Cream (`#FFFDF9`), Terracotta (`#D97757`), Sage (`#A8C3A0`), Peach (`#F4B8A8`), and Soft Gold (`#E7C57B`) with dark mode support.
- 📡 **Offline Awareness**: Real-time network detection with user-friendly offline status banners.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, React Router v6.
- **Backend / Storage**: Firebase Authentication, Cloud Firestore (with GeoPoint & subcollections).
- **Media CDN**: Cloudinary REST API.
- **AI Engine**: Google Gemini API (`@google/generative-ai`).

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and `npm` installed.
- A Firebase project with **Authentication** and **Cloud Firestore** enabled.
- A Cloudinary account for media upload.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/memorando.git
   cd memorando
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and populate your public keys:
   ```bash
   cp .env.example .env
   ```

   `.env` structure:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
   ```

4. **Deploy Firestore Security Rules**:
   Upload [`firestore.rules`](firestore.rules) to your Firebase Console under Firestore Security Rules to enforce strict user data isolation.

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

6. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🔒 Security & Privacy

Memorando is strictly private to the authenticated user. Security features include:
- Ownership checks (`request.auth.uid == resource.data.userId`) in [`firestore.rules`](firestore.rules).
- Dynamic timestamp validation (`currentTime >= unlockDate`) for Memory Capsules and Future Letters.
- Zero server secrets stored in client-side `VITE_*` environment variables.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
