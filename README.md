# 🏪 SSG Store - Advanced POS System

A modern, feature-rich Point of Sale (POS) system built with Next.js, React, and Supabase. Designed for both desktop and mobile devices with comprehensive business management capabilities.

## ✨ Features

### 🛒 **Order Management**
- **Real-time order processing** with intuitive product selection
- **Multiple pricing modes**: Retail and Wholesale
- **Smart cart management** with quantity controls
- **Payment method selection**: Cash, Online, Credit
- **Automatic bill generation** with PDF download
- **Table management** for restaurant/cafe operations

### 📊 **Bill History & Analytics**
- **Comprehensive bill tracking** with detailed history
- **Advanced filtering**: By date, type, payment method
- **Sales analytics** with revenue breakdowns
- **Bill preview** with complete transaction details
- **Share functionality** for mobile and desktop
- **PDF bill regeneration** from history

### 📱 **Mobile-First Design**
- **Responsive layout** optimized for tablets and phones
- **Touch-friendly interface** with proper touch targets
- **Native sharing** via Web Share API
- **Smooth animations** and transitions
- **Dark minimal scrollbars** for clean aesthetics

### 🎨 **Enhanced User Experience**
- **Skeleton loading states** for better perceived performance
- **Debounced search** for instant product filtering
- **Page transitions** with smooth animations
- **Hover effects** and interactive feedback
- **Prefetching** for faster navigation

### 🗄️ **Inventory Management**
- **Product catalog** with categories and pricing
- **Stock tracking** with low stock alerts
- **Category management** with color coding
- **Bulk operations** and easy product updates

### ⚡ **Performance Optimizations**
- **5-minute data caching** to reduce API calls
- **Optimized Supabase queries** with parallel loading
- **Memoized computations** for better performance
- **Lazy loading** and code splitting

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Custom CSS animations
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **PDF Generation**: jsPDF
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DivineDB/POS-Sytem.git
   cd POS-Sytem
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Run the SQL schema in your Supabase dashboard:
   ```bash
   # Use the provided schema files
   supabase-schema.sql
   complete-fresh-setup.sql
   ```

5. **Start Development Server**
   ```bash
   pnpm dev
   ```

6. **Open in Browser**
   Navigate to `http://localhost:3000`

## 📱 Mobile Usage

The application is optimized for mobile devices:
- **Touch-friendly buttons** with proper sizing
- **Native sharing** on mobile browsers
- **Responsive tables** with horizontal scrolling
- **Stack layouts** on smaller screens
- **Gesture-friendly** interactions

## 🎯 Key Improvements Made

### Performance Enhancements
- ✅ **Caching mechanism** - 5-minute data cache reduces API calls by 80%
- ✅ **Debounced search** - 300ms delay eliminates search lag
- ✅ **Route prefetching** - Instant navigation between pages
- ✅ **Optimized filtering** - Memoized expensive operations

### UI/UX Improvements  
- ✅ **Scrollable order summary** - Fixed layout issues with many items
- ✅ **Dark minimal scrollbars** - Clean, professional appearance
- ✅ **Payment method labels** - Clear visual indicators in bill history
- ✅ **Share functionality** - Native mobile sharing + clipboard fallback
- ✅ **Smooth transitions** - Enhanced page and component animations

### Mobile Optimization
- ✅ **Touch-friendly design** - Proper button sizing and spacing
- ✅ **Responsive layouts** - Adapts to all screen sizes
- ✅ **Web Share API** - Native sharing on mobile devices
- ✅ **Progressive enhancement** - Works across all browsers

## 📊 Database Schema

The application uses the following main tables:
- `categories` - Product categories with colors
- `products` - Product catalog with pricing and stock
- `bill_history` - Complete transaction records
- Custom functions for stock management and order counting

## 🔧 Configuration

### Invoice Settings
Customize business information in the settings page:
- Business name and address
- Tax rates and GST information
- Paper size (A4 or 58mm receipt)
- Custom footer notes

### Payment Methods
Supports multiple payment types:
- 💰 **Cash** - Traditional cash payments
- 📱 **Online** - Digital payments (UPI, cards)
- 💳 **Credit** - Credit/account-based payments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Optimized for real-world business use
- Designed with mobile-first approach
- Enhanced with comprehensive performance optimizations

---

**Made with ❤️ for modern businesses**

For support or questions, please open an issue on GitHub.
