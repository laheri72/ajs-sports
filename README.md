# SportSync | Jamea Saifiyah Sports

SportSync is a specialized sports management platform designed for Jamea Saifiyah.

## Tech Stack

- **Framework**: [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Backend/Auth**: [Supabase](https://supabase.com/)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

1. Clone the repository
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file based on the environment variables needed for Supabase:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Development

Start the development server:
```sh
npm run dev
```

## Deployment

The project can be built for production using:
```sh
npm run build
```
The resulting `dist` folder can be hosted on platforms like Vercel, Netlify, or your own server.
