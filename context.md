# Project Context: SSG Store POS System

This document outlines the current state, architecture, and ongoing development tasks for the SSG Store Point of Sale (POS) system.

## 🛠️ Tech Stack & Architecture

- **Frontend Framework**: Next.js (App Router, React 18, TypeScript)
- **Styling**: TailwindCSS & Global CSS rules
- **State Management**: Zustand (for persistent local state like categories, products, orders, and invoice settings)
- **Database & Authentication**: Supabase (PostgreSQL tables for categories, products, bill history; Supabase GoTrue for auth)
- **PDF Generation**: jsPDF (custom client-side generator)

## 📂 Key Codebase Components

- [app/orders/page.tsx](file:///d:/DBs/codes/posL/POS-Sytem/app/orders/page.tsx): Main Point of Sale ordering screen.
- [components/pos/order-summary.tsx](file:///d:/DBs/codes/posL/POS-Sytem/components/pos/order-summary.tsx): The right-hand sidebar component displaying current cart items, total price, payment method, and controls to place the order/generate invoice.
- [components/pos/sidebar.tsx](file:///d:/DBs/codes/posL/POS-Sytem/components/pos/sidebar.tsx): Main navigation sidebar.
- [lib/store.ts](file:///d:/DBs/codes/posL/POS-Sytem/lib/store.ts): Zustand store for local persistence.
- [context/auth-context.tsx](file:///d:/DBs/codes/posL/POS-Sytem/context/auth-context.tsx): Supabase authentication context.

### 1. Employee Profile Switcher & Header Cleanup in Order Summary (Completed)
- **Goal**: Add an employee profile switcher in the `OrderSummary` header and remove the hardcoded "Table 5" label.
- **Details**:
  - Replaced the static branch display with an interactive cashier/employee profile switcher dropdown.
  - Switched the icon to a `User` icon to match the employee theme.
  - Removed the `"Table 5"` text display from this header section.
  - Set the active cashier name to be saved to the database and printed on PDF receipts under `CASHIER:` instead of `TABLE:`.
  - Added conditional label handling (`CASHIER` or `TABLE`) in both the PDF receipt and the bill history sharing text.

### 2. Minimal Date & Time Widget on Orders Page (Completed)
- **Goal**: Render a minimal real-time date and time display on the orders page.
- **Details**:
  - Added a dynamic real-time clock widget next to the search bar on [orders/page.tsx](file:///d:/DBs/codes/posL/POS-Sytem/app/orders/page.tsx).
  - Formatted the widget with a subtle badge styling containing calendar date and 12-hour clock time.

### 3. Role Integration & Login-based Auto Profile Update (Completed)
- **Goal**: Add user roles, allow selecting role during signup, and automatically load logged-in user details in the active cashier profile switcher.
- **Details**:
  - **Login Schema Update**: Added a role selection field (`Owner` / `Cashier`) to the register form in [login/page.tsx](file:///d:/DBs/codes/posL/POS-Sytem/app/login/page.tsx). The selected role is saved as `role` inside the Supabase `user_metadata` schema.
  - **Auto Sync**: Imported `useAuth` into [order-summary.tsx](file:///d:/DBs/codes/posL/POS-Sytem/components/pos/order-summary.tsx) and added a `useEffect` hook to automatically set the `activeProfile` to `${full_name} (${role})` based on the active Supabase session.
  - **Manual Switcher Fallback**: Retained the cashier selector list as a fallback menu to allow employees to quickly switch to another cashier if needed without signing out completely.


### 4. Database Schema and Checkout Fixes (Completed)
- **Goal**: Resolve database insert failures during checkouts.
- **Details**:
  - Added the missing `payment_method` column to the `bill_history` table in the database schema.
  - Altered the `table_number` field constraint from `VARCHAR(20)` to `VARCHAR(100)` to prevent SQL overflows when cashier names (e.g., `"Admin Cashier (Owner)"`, 21 chars) exceed the length limit.

### 5. UI Alignment & Card Clipping Fixes (Completed)
- **Goal**: Fix outline corner clipping on selected category cards and align category cards grid layout.
- **Details**:
  - Replaced high-contrast outer shadow rings (`ring-2`) on selected category cards with internal borders (`border-2 border-foreground p-[15px]`) to eliminate outline corner clipping caused by parent `overflow-hidden`.
  - Standardized all category cards' name and items count layouts by setting a fixed height (`h-14`) and `line-clamp-2` on card titles in [category-card.tsx](file:///d:/DBs/codes/posL/POS-Sytem/components/pos/category-card.tsx).

### 6. Unified Category Deletion Support (Completed)
- **Goal**: Enable fully working category deletion across both Supabase and Guest modes.
- **Details**:
  - Implemented the `deleteCategory` method in the Zustand store in [store.ts](file:///d:/DBs/codes/posL/POS-Sytem/lib/store.ts) to support offline mode deletion and automatically cascade delete products in that category.
  - Linked the inventory view's delete action in [inventory/page.tsx](file:///d:/DBs/codes/posL/POS-Sytem/app/inventory/page.tsx) directly to `deleteCategory` (hook or Zustand) to immediately update client state and clear the local persistent data cache without needing page reloads.

### 7. Hosted Platform Resiliency (Completed)
- **Goal**: Prevent hosted site crashes due to missing environment variables.
- **Details**:
  - Configured hardcoded public Supabase URL and Anon Key as fallback values inside [supabase.ts](file:///d:/DBs/codes/posL/POS-Sytem/lib/supabase.ts) so the application connects automatically on platforms like Vercel even if env keys are not explicitly set in the dashboard.
