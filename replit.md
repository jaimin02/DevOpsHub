# DevOps Hub - Firebase Studio Next.js Application

## Overview
DevOps Hub is a comprehensive Next.js application for managing server infrastructure, database credentials, port management, security, IQ (Installation Qualification) records, and user administration. It was originally created with Firebase Studio integration and Genkit AI capabilities.

**Current State**: Successfully configured for both Replit and local Windows/Mac/Linux environments with unified top navigation bar and sidebar across all pages.

## Recent Changes (December 01, 2025)
- **Fixed Windows Compatibility** - Updated npm scripts to use `cross-env` package for cross-platform environment variable support
- **Unified Application Layout** - All pages now use shared authenticated layout with consistent header and sidebar
- **Removed Duplicate Layouts** - Deleted 27 individual page layout files to prevent duplicate navigation bars
- **Complete Page Organization** - Moved all 20+ pages into authenticated route group for consistency
- **Fixed Notification System** - Created standalone notifications page accessible from user menu
- **Dashboard Highlighting** - Enhanced dashboard tiles with color-coded borders and hover animations

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15.3.3
- **Language**: TypeScript
- **UI Library**: Radix UI components
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **AI Integration**: Google Genkit AI (installed but not currently used in code)
- **PDF Generation**: jsPDF
- **Data Export**: XLSX
- **Cross-Platform Support**: cross-env (for npm scripts)

### Project Structure
```
src/
├── app/
│   ├── (authenticated)/          # Authenticated route group
│   │   ├── layout.tsx            # Single shared layout for all pages
│   │   ├── dashboard/            # Dashboard page
│   │   ├── notifications/        # Notifications management page
│   │   ├── inventory/            # Server inventory
│   │   ├── locations/            # Location management
│   │   ├── os/                   # Operating system data
│   │   ├── database-providers/   # Database provider management
│   │   ├── db-credentials/       # Database credentials
│   │   ├── dept-name/            # Department management
│   │   ├── environment/          # Environment settings
│   │   ├── antivirus/            # Antivirus management
│   │   ├── iq-details/           # IQ details management
│   │   ├── iq-master/            # IQ master data
│   │   ├── iq-required/          # IQ requirements
│   │   ├── iq-review/            # IQ review
│   │   ├── port-management/      # Port rules and management
│   │   ├── reports/              # Reporting pages
│   │   ├── role-master/          # Role management
│   │   ├── security/             # Security settings
│   │   ├── server-infrastructure/# Server infrastructure
│   │   ├── user-administration/  # User admin
│   │   ├── user-management/      # User management
│   │   ├── master/               # Master data
│   │   └── reports/              # Reports
│   ├── login/                    # Login page (outside authenticated)
│   └── forgot-password/          # Password reset (outside authenticated)
├── components/
│   ├── ui/                       # Radix UI component library
│   ├── NotificationsPanel.tsx    # Popover notifications dropdown
│   ├── DevOpsHubLogo.tsx         # Custom logo component
│   └── [other components]
├── lib/                          # Utility functions
├── context/                      # React context providers
└── hooks/                        # Custom React hooks
```

### Key Features
1. **Unified Navigation** - All pages share one header with search, notifications, theme toggle, and user menu
2. **Consistent Sidebar** - Collapsible navigation menu with expand/collapse animation
3. **User Authentication**: Login page with form validation
4. **Server Management**: Infrastructure and inventory tracking
5. **Database Management**: Credentials and provider management
6. **Port Management**: Port rules and configuration
7. **Security**: Antivirus and security settings
8. **Reporting**: Various report generation capabilities
9. **Role Management**: User roles and permissions
10. **Department Management**: Organizational structure
11. **Notification System**: Dropdown menu from bell icon and dedicated notifications page

## Development Setup

### Running Locally

#### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

#### On Windows, Mac, or Linux
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Server will start at http://localhost:5000
```

The application now works seamlessly on **all operating systems** (Windows, Mac, Linux) thanks to the `cross-env` package which handles environment variables correctly on each platform.

#### Running on Replit
```bash
npm run dev
```
Server runs on port 5000 and is accessible via Replit's proxy.

### Building for Production
```bash
npm run build
npm start
```

### Environment Configuration
- Development server: http://0.0.0.0:5000 (accessible on all network interfaces)
- Configured to work with local development and Replit's proxy/iframe setup
- Memory optimized with NODE_OPTIONS for Next.js 15 compatibility on Replit

## Deployment
Configured for autoscale deployment with:
- Build command: `npm run build`
- Run command: `npm start`
- Port: 5000

## UI Features

### Top Navigation Bar (All Pages)
- **Search Bar** - "Search servers, users, reports..."
- **Notifications Bell** - With unread count badge, opens dropdown menu
- **Theme Toggle** - Switch between light and dark mode
- **User Avatar** - Gradient background (JR), opens dropdown menu with:
  - Admin user info (name and email)
  - Settings option
  - Notifications link (goes to full notifications page)
  - Logout option

### Sidebar Navigation (All Pages)
- **Logo** - DevOps Hub branding, expands/collapses on hover
- **Menu Items** - Dashboard, IQ Master, Security, Reports, Master, User Administration
- **Submenu Support** - Collapsible menus for pages with related items
- **Active State Highlighting** - Current page highlighted
- **System Status** - Shows "System Online" indicator at bottom when expanded

### Dashboard Tiles
- **Color-Coded Cards** with gradient backgrounds
- **Hover Animations** - Scale up and brighten on hover
- **Icons & Numbers** - Large, visible metrics
- **Clickable** - Each tile navigates to relevant page

### Notifications System
- **Bell Icon** - In top navigation with unread badge
- **Dropdown Menu** - Click bell to see recent notifications
- **Notification Types** - Server, IQ, Security, User, System
- **Full Page** - Access via user menu → "Notifications" for complete management
- **Actions** - Mark as read, delete, navigate to relevant page

## Known Issues
- Minor browser console hydration warnings (non-critical, typical for Next.js)
- Auto-refresh on dashboard uses local state (can be extended with real API calls)
- Old LSP errors may appear until cache is fully cleared (functional code is correct)

## Dependencies Management
All dependencies are managed through npm. Key dependencies include:
- Next.js, React, and React DOM for the framework
- Radix UI components for accessible UI elements
- Tailwind CSS for styling
- Firebase for backend services
- Genkit for AI capabilities
- cross-env for cross-platform npm scripts

## Cross-Platform Support
The application now fully supports Windows, Mac, and Linux:
- `cross-env` package handles environment variables correctly on all platforms
- npm scripts work seamlessly regardless of operating system
- Same development experience across all systems

## User Preferences
None specified yet.

