# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



# Campor — Campus Marketplace Web App

Campor is an e-commerce marketplace built specifically for Redeemers University (RUN) students. 
Every account is verified using the student's official @run.edu.ng email. 
The platform enables peer-to-peer buying, selling, and trading of items and services within the campus community.

## Core Concepts
- **Target audience:** RUN students only (verification via university email).
- **Tech stack:** React (Vite) + Tailwind CSS for the frontend, Node.js backend (API accessed via deployed link).
- **Design source:** Figma file (converted to responsive components using Tailwind).
- **Navigation:** React Router with MainLayout (Navbar + Footer) for public pages, and AuthLayout for authentication pages.

## Main Features
1. **Authentication Flow**
   - Sign up with @run.edu.ng email (name, password, confirm password).
   - Sign in with email + password.
   - Email verification page (enter code sent to email).
   - Default account type is "Buyer".
   - Option to apply as "Seller" from profile.

2. **Marketplace**
   - Browse all products/services with search & category filter.
   - Product detail page (images, description, price, seller info).
   - Add to cart & checkout.
   - Direct messaging between buyers and sellers.

3. **Seller Flow**
   - Apply to become a seller (store info, bank details, contact info).
   - Seller dashboard: view orders, upload products, track revenue.
   - Add/edit/delete products.

4. **Orders & Payments**
   - Secure payment integration (Paystack).
   - Order history for buyers.
   - Collection code displayed after payment.

5. **UI Requirements**
   - Responsive (mobile-first, scales well on desktop).
   - Use Tailwind CSS for styling (keep class names clean & semantic).
   - Keep reusable components in `/components/`.
   - Use placeholder images where actual images are not yet available.
   - Match the structure from the folder setup:
     - `pages/` → full-page components
     - `layouts/` → wrappers for pages
     - `components/` → reusable UI parts
     - `context/` → React Context for global state (e.g., AuthContext, CartContext)
     - `services/` → API calls (mock until backend is connected)
     - `utils/` → helper functions and constants

## Style Guide
- Colors: Blue (#2563eb), White (#ffffff), Neutral Grays (#f9fafb, #6b7280).
- Typography: Use bold weights for headings, regular for body.
- Buttons: Rounded corners, hover effects.
- Layout: Container width `max-w-7xl` with `mx-auto` for centering.

## Development Notes for Copilot
- When building UI from the Figma, preserve responsiveness.
- Leave placeholder images where the actual asset is not yet available.
- Use Tailwind’s utility-first approach for layout and spacing.
- Keep components small and reusable.
- Connect to mock data first, then replace with real API calls from `services/` folder.
