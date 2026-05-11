# Court Services Dashboard

A modern, production-ready web application that helps citizens navigate court services through a clean claymorphism UI.

## Tech Stack

- **React 18** + **Vite**
- **React Router DOM v6**
- **Tailwind CSS** (custom claymorphism design system)
- No external UI libraries

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Install & Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
court-services/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx        # Hero header with gradient
│   │   ├── ServiceCard.jsx   # Clay card for each service
│   │   └── Chatbot.jsx       # Floating AI chat assistant
│   ├── pages/
│   │   ├── HomePage.jsx      # Service grid landing page
│   │   └── DetailPage.jsx    # Individual service detail
│   ├── data/
│   │   └── services.js       # All service data + bot responses
│   ├── App.jsx               # Router setup
│   ├── main.jsx              # Entry point
│   └── index.css             # Tailwind + clay design system
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Features

- **6 Court Services**: File a Complaint, Schedule a Hearing, Request Records, Submit an Appeal, Respond to a Summons, Request Mediation
- **Detail Pages**: Step-by-step process, required documents, location/hours/fee/status
- **Chatbot**: Floating assistant with keyword-based responses and quick-reply chips
- **Claymorphism Design**: Soft 3D-like surfaces, layered shadows, hover lift effects
- **WCAG 2.2 AA**: Keyboard navigation, focus rings, ARIA labels, aria-live regions
- **Responsive**: 1-col mobile → 2-col tablet → 3-col desktop

## Design System

| Token | Value |
|-------|-------|
| Primary | `#3B82F6` |
| Background | `#F0F4FF` |
| Surface | `#FFFFFF` |
| Text | `#1F2937` |
| Muted | `#6B7280` |
| Card radius | `20px` |
| Button radius | `12px` |
| Font | Poppins |
