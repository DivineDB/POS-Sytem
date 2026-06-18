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



