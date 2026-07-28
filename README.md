# Vertex3D — 3D Model Platform

A Pinterest-style 3D model showcase platform built with the MERN stack.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)

### 1. Start the Server
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

### 2. Start the Client
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## 📁 Project Structure

```
3d/
├── client/          # React + Vite frontend
│   └── src/
│       ├── api/         # Axios instance
│       ├── components/  # Navbar, Footer, ModelCard, ModelViewer, etc.
│       ├── context/     # Auth context (JWT)
│       └── pages/       # Home, Login, Register, Upload, ModelDetail
│
└── server/          # Node + Express backend
    ├── models/      # Mongoose schemas (User, Model, Comment)
    ├── routes/      # REST API routes
    ├── middleware/  # JWT auth middleware
    └── uploads/     # Uploaded 3D files (auto-created)
```

## ✨ Features

- **Auth**: Register/Login with bcrypt + JWT
- **Upload**: .glb / .gltf / .obj files up to 100MB with live preview
- **3D Viewer**: Interactive Three.js viewer on every card and detail page
- **Pinterest Layout**: Masonry grid with auto-rotating 3D thumbnails
- **Comments**: Real-time add/delete with author name
- **Similar Models**: Shown at the bottom of every detail page
- **Likes & Views**: Track engagement per model
- **Glass Morphism UI**: Apple-inspired frost glass design

## 🎨 Design
- Dark theme: `#07071a` base
- Capsule frosted-glass navbar
- `backdrop-filter: blur()` glass cards
- Inter font from Google Fonts
- Purple-blue gradient accent system
