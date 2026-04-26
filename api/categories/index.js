// Re-export the catch-all handler for the base /api/categories route
// Vercel doesn't always match [[...path]] for the root path
export { default } from './[[...path]].js';
