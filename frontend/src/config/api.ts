/**
 * PRAHARI AI – Central API Configuration
 *
 * In development: uses http://localhost:8000 (local FastAPI server)
 * In production (Vercel): uses VITE_API_URL environment variable
 *
 * Set VITE_API_URL in Vercel project settings → Environment Variables
 * to point to your deployed backend URL (e.g. Railway / Render).
 */
export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
