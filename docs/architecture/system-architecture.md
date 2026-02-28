# System Architecture - Synkra AIOS Dashboard

**Project:** Synkra AIOS Dashboard
**Type:** Financial/Business Management System
**Framework:** Vite + React 18 + TypeScript
**Status:** Active Development
**Last Updated:** 2026-02-27

---

## Executive Summary

Synkra AIOS Dashboard is a modern financial management system built with React 18, TypeScript, and Tailwind CSS. The application provides comprehensive features for ad campaign management, financial tracking, team collaboration, and multi-factor authentication. The codebase follows a component-driven architecture with Supabase as the backend.

**Key Characteristics:**
- ✅ Modern tech stack (Vite, React 18, TypeScript)
- ✅ Comprehensive UI component library (shadcn/ui + Radix)
- ✅ Strong authentication layer with MFA support
- ✅ Data-driven architecture with React Query
- ✅ Role-based access control (RBAC)
- ✅ Tailwind CSS with HSL color theming

---

## Technology Stack

### Core Framework
| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Build Tool** | Vite | 5.4.19 | Fast dev server, optimized builds |
| **Runtime** | React | 18.3.1 | UI component framework |
| **Language** | TypeScript | 5.8.3 | Static type checking |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS |
| **Component Library** | shadcn/ui | - | Accessible UI primitives (Radix UI) |

### State & Data Management
| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Data Fetching** | TanStack React Query | 5.83.0 | Server state management, caching |
| **Forms** | React Hook Form | 7.61.1 | Form state & validation |
| **Form Validation** | Zod | 3.25.76 | Schema validation |
| **Routing** | React Router | 6.30.1 | Client-side routing |

### Backend & Authentication
| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Backend/Database** | Supabase | 2.91.0 | PostgreSQL, Auth, RLS |
| **Auth Method** | Supabase Auth | - | JWT-based authentication |
| **MFA** | TOTP (Time-based OTP) | - | Two-factor authentication |

### UI & Animation
| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Animations** | Framer Motion | 12.29.0 | Smooth transitions |
| **Charts** | Recharts | 2.15.4 | Data visualization |
| **Icons** | Lucide React | 0.462.0 | Icon library |
| **Notifications** | Sonner | 1.7.4 | Toast notifications |
| **Themes** | next-themes | 0.3.0 | Dark/Light mode |
| **Drawers** | Vaul | 0.9.9 | Sheet/Drawer component |
| **Carousels** | Embla Carousel | 8.6.0 | Carousel component |

### Development Tools
| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Testing** | Vitest | 3.2.4 | Unit & integration testing |
| **Testing Library** | @testing-library/react | 16.0.0 | Component testing utilities |
| **Linting** | ESLint | 9.32.0 | Code quality |
| **Type Checking** | TypeScript | 5.8.3 | Type safety |
| **Component Tagging** | lovable-tagger | 1.1.13 | Development tool (Lovable integration) |

---

## Project Structure

```
src/
├── pages/                          # Routed page components
│   ├── Index.tsx                  # Dashboard home
│   ├── Login.tsx                  # Authentication
│   ├── Platforms.tsx              # Ad platforms management
│   ├── Tools.tsx                  # Development tools
│   ├── VariableExpenses.tsx       # Expense tracking
│   ├── Team.tsx                   # Team/Collaborators
│   ├── Ads.tsx                    # Ad campaigns
│   ├── Withdrawals.tsx            # Withdrawal management
│   ├── Taxes.tsx                  # Tax calculations
│   ├── History.tsx                # Activity history
│   ├── Profile.tsx                # User profile
│   ├── AllowedUsers.tsx           # Admin: user management
│   ├── AccessLogs.tsx             # Admin: audit logs
│   └── NotFound.tsx               # 404 page
│
├── components/
│   ├── ui/                        # shadcn/ui primitives (60+ components)
│   │   ├── button.tsx, input.tsx, dialog.tsx, card.tsx, etc.
│   │   ├── form.tsx               # React Hook Form integration
│   │   └── [radix-based components]
│   │
│   ├── layout/                    # Layout components
│   │   ├── DashboardLayout.tsx    # Main app layout
│   │   └── Sidebar.tsx            # Navigation sidebar
│   │
│   ├── dashboard/                 # Dashboard-specific
│   │   ├── AlertCard.tsx
│   │   ├── MetricCard.tsx
│   │   ├── CashFlowChart.tsx
│   │   ├── RevenueExpensesChart.tsx
│   │   └── PerformanceChart.tsx
│   │
│   ├── forms/                     # Form dialogs
│   │   ├── PlatformFormDialog.tsx
│   │   ├── ToolFormDialog.tsx
│   │   ├── VariableExpenseFormDialog.tsx
│   │   ├── WithdrawalFormDialog.tsx
│   │   ├── TaxFormDialog.tsx
│   │   ├── AdPerformanceFormDialog.tsx
│   │   ├── CollaboratorFormDialog.tsx
│   │   └── CsvUploadDialog.tsx
│   │
│   ├── ads/                       # Ad-specific components
│   │   └── CampaignExpandedRow.tsx
│   │
│   ├── mfa/                       # Multi-factor authentication
│   │   ├── MFAChallengeDialog.tsx
│   │   ├── MFAEnrollDialog.tsx
│   │   └── MFASettings.tsx
│   │
│   ├── ProtectedRoute.tsx         # Route protection wrapper
│   └── NavLink.tsx                # Navigation link component
│
├── contexts/
│   └── AuthContext.tsx            # Global authentication state
│
├── hooks/                         # Custom React hooks
│   ├── usePlatforms.ts
│   ├── useTools.ts
│   ├── useVariableExpenses.ts
│   ├── useWithdrawals.ts
│   ├── useTaxes.ts
│   ├── useAdCampaigns.ts
│   ├── useAdPerformance.ts
│   ├── useCollaborators.ts
│   ├── useMFA.ts
│   ├── useAuditLog.ts
│   ├── useLoginAudit.ts
│   ├── useAllowedUsers.ts
│   ├── useDismissedAlerts.ts
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── integrations/
│   └── supabase/
│       ├── client.ts              # Supabase client initialization
│       └── types.ts               # Auto-generated TypeScript types
│
├── lib/
│   └── utils.ts                   # Utility functions
│
├── data/
│   └── mockData.ts                # Mock data for development
│
├── types/
│   └── dashboard.ts               # TypeScript type definitions
│
├── test/
│   ├── example.test.ts
│   └── setup.ts                   # Vitest configuration
│
├── assets/                        # Images, static files
├── App.tsx                        # Main app component
├── main.tsx                       # React entry point
└── vite-env.d.ts
```

---

## Core Architectural Patterns

### 1. Authentication & Authorization

**Pattern:** Context-based global state with role-based access control (RBAC)

```typescript
// AuthContext.tsx provides:
- user: User | null
- loading: boolean
- error: string | null
- signIn(email, password): Promise
- signUp(email, password): Promise
- signOut(): Promise
- roles: 'admin' | 'manager' | 'viewer'
```

**Features:**
- ✅ JWT-based authentication via Supabase Auth
- ✅ Session persistence with auto-refresh
- ✅ Multi-factor authentication (TOTP)
- ✅ Role-based route protection via `ProtectedRoute` component
- ✅ Admin-only routes enforced with `requireAdmin` prop

**Integration Points:**
- `App.tsx` wraps app with `<AuthProvider>`
- `ProtectedRoute` guards all authenticated pages
- `AccessLogs` page shows admin audit trail
- `AllowedUsers` page manages user permissions (admin-only)

### 2. Data Management with React Query

**Pattern:** Hook-based data fetching with automatic caching

```typescript
// Example hook (usePlatforms.ts)
export const usePlatforms = () => {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platforms')
        .select('*');
      if (error) throw error;
      return data;
    },
  });
};
```

**Benefits:**
- ✅ Automatic request deduplication
- ✅ Built-in caching with configurable stale time
- ✅ Background refetching
- ✅ Optimistic updates support
- ✅ Error handling and retry logic

**Key Hooks:**
- `usePlatforms` - Ad platforms (Facebook, Google, etc.)
- `useAdCampaigns` - Campaign management
- `useTools` - Development tools
- `useVariableExpenses` - Flexible expenses
- `useWithdrawals` - Withdrawal records
- `useTaxes` - Tax information
- `useCollaborators` - Team members
- `useAuditLog` - Activity logging

### 3. Form Architecture

**Pattern:** React Hook Form + Zod + shadcn/ui Form component

```typescript
// Pattern used across all form dialogs
const MyForm = () => {
  const form = useForm<MySchema>({
    resolver: zodResolver(mySchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="fieldName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
```

**Benefits:**
- ✅ Schema-based validation (Zod)
- ✅ Type-safe form handling
- ✅ Automatic error messages
- ✅ Accessible error states

**Form Dialogs:**
- `PlatformFormDialog` - Add/edit ad platforms
- `ToolFormDialog` - Manage tools
- `VariableExpenseFormDialog` - Track expenses
- `WithdrawalFormDialog` - Record withdrawals
- `TaxFormDialog` - Tax tracking
- `AdPerformanceFormDialog` - Campaign performance
- `CollaboratorFormDialog` - Team members
- `CsvUploadDialog` - Bulk imports

### 4. Component Structure

**Pattern:** Functional components with TypeScript interfaces

```typescript
// Standard component pattern
interface MyComponentProps {
  title: string;
  onAction: () => void;
  isLoading?: boolean;
}

export default function MyComponent({
  title,
  onAction,
  isLoading = false
}: MyComponentProps) {
  return <div>{title}</div>;
}
```

**Naming Conventions:**
- ✅ Components: PascalCase (e.g., `PlatformCard`, `AlertDialog`)
- ✅ Hooks: camelCase with `use` prefix (e.g., `usePlatforms`)
- ✅ Utils: camelCase (e.g., `formatCurrency`)
- ✅ Files match component names

### 5. Styling Architecture

**Pattern:** Tailwind CSS with HSL color system

```typescript
// tailwind.config.ts defines HSL variables
colors: {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  // ... more colors
}

// Custom animations
keyframes: {
  "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
  "slide-in": { from: { translateX: "-10px" }, to: { translateX: "0" } },
  "pulse-glow": { /* gradient effect */ }
}
```

**Features:**
- ✅ Dark mode support (`darkMode: ["class"]`)
- ✅ Consistent color theming with CSS variables
- ✅ Custom animations (fade-in, slide-in, pulse-glow)
- ✅ shadcn/ui component library with full customization
- ✅ Responsive design with Tailwind breakpoints

### 6. Routing Architecture

**Pattern:** React Router v6 with protected routes

```typescript
// App.tsx route structure
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/platforms" element={<ProtectedRoute><Platforms /></ProtectedRoute>} />
    {/* Admin-only routes */}
    <Route path="/allowed-users" element={<ProtectedRoute requireAdmin><AllowedUsers /></ProtectedRoute>} />
    <Route path="/access-logs" element={<ProtectedRoute requireAdmin><AccessLogs /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

**Pages (11 user routes + 2 admin routes):**
- `/` - Dashboard (Index)
- `/login` - Authentication
- `/platforms` - Ad platforms
- `/ads` - Ad campaigns
- `/tools` - Development tools
- `/variable-expenses` - Expense tracking
- `/team` - Collaborators
- `/withdrawals` - Withdrawal records
- `/taxes` - Tax management
- `/history` - Activity log
- `/profile` - User profile
- `/allowed-users` - User management (admin)
- `/access-logs` - Audit logs (admin)

### 7. Database Integration (Supabase)

**Pattern:** Auto-generated TypeScript types with RLS policies

**Key Tables:**
- `profiles` - User profiles with roles
- `platforms` - Ad platforms
- `ad_campaigns` - Advertising campaigns
- `tools` - Development tools
- `variable_expenses` - Flexible expenses
- `withdrawals` - Withdrawal records
- `taxes` - Tax information
- `collaborators` - Team members
- `audit_logs` - Activity logging

**Features:**
- ✅ Row-level security (RLS) policies
- ✅ Auto-generated TypeScript types (`types.ts`)
- ✅ JWT authentication
- ✅ Session persistence with localStorage
- ✅ Real-time subscription capability (not yet implemented)

---

## Identified Technical Debts

### Critical Issues

| ID | Debt | Severity | Impact | Effort |
|-----|------|----------|--------|--------|
| SYS-001 | ESLint configuration with strict type checking enabled | CRITICAL | Type safety, CI/CD failures | Medium |
| SYS-002 | TypeScript relaxed settings (noImplicitAny: false) | HIGH | Type safety holes, maintenance burden | Medium |
| SYS-003 | No error boundary implementation | HIGH | Silent failures, poor UX | Low |
| SYS-004 | Missing request timeout handling | HIGH | Hanging requests, poor UX | Low |

### Medium-Priority Issues

| ID | Debt | Severity | Impact | Effort |
|------|------|----------|--------|--------|
| SYS-005 | No comprehensive error logging system | MEDIUM | Difficult debugging in production | Medium |
| SYS-006 | Limited test coverage (minimal unit tests) | MEDIUM | Regression risks, confidence in refactoring | High |
| SYS-007 | No performance monitoring/metrics | MEDIUM | Can't identify bottlenecks | Medium |
| SYS-008 | Form validation messages not localized | MEDIUM | Limited i18n support | Medium |
| SYS-009 | No input sanitization in CSV upload | MEDIUM | Potential XSS/injection vulnerabilities | Low |
| SYS-010 | Lovable-tagger still in dependencies | LOW | Development-only tool, not for production | Low |

### Code Quality Issues

| ID | Debt | Severity | Impact | Effort |
|------|------|----------|--------|--------|
| SYS-011 | Inconsistent error handling across hooks | MEDIUM | Hard to debug, poor user feedback | Medium |
| SYS-012 | No pagination in data-heavy pages | MEDIUM | Performance issues at scale | High |
| SYS-013 | Missing loading states in some dialogs | LOW | Poor UX feedback | Low |
| SYS-014 | No graceful degradation for failed requests | MEDIUM | Bad UX on network issues | Medium |

### Infrastructure Issues

| ID | Debt | Severity | Impact | Effort |
|------|------|----------|--------|--------|
| SYS-015 | No environment-based config separation | LOW | Configuration management pain | Low |
| SYS-016 | No health check endpoint | LOW | Difficult monitoring in production | Low |
| SYS-017 | No service worker for offline support | LOW | No offline functionality | Medium |

---

## Code Standards & Conventions

### TypeScript
- **Current Setting:** `noImplicitAny: false` (relaxed)
- **Recommendation:** Enable stricter checking gradually
- **Import Aliases:** `@/*` maps to `src/*`
- **Type Imports:** Use `type` keyword: `import type { User } from '@/types'`

### Component Conventions
```typescript
// ✅ Correct pattern
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export default function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

### Naming Conventions
- **Components:** PascalCase (`PlatformCard`, `UserProfile`)
- **Hooks:** camelCase with `use` prefix (`usePlatforms`, `useAuth`)
- **Utilities:** camelCase (`formatCurrency`, `calculateTax`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Database Columns:** snake_case (`created_at`, `user_id`)

### Styling Rules
- ✅ Use Tailwind utility classes (not inline styles)
- ✅ Organize classes: layout → spacing → sizing → colors → effects
- ✅ Use `clsx()` for conditional classes
- ✅ Leverage custom animations: `animate-fade-in`, `animate-slide-in`

### Import Organization
```typescript
// 1. React & hooks
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Third-party libraries
import { Button } from '@/components/ui/button';

// 3. Local components
import { DashboardLayout } from '@/components/layout';

// 4. Types
import type { Platform } from '@/integrations/supabase/types';
```

---

## Performance Characteristics

### Bundle Size
- **Framework:** ~45KB (React + React Router minified/gzipped)
- **UI Library:** ~20KB (shadcn/ui primitives)
- **Charts:** ~50KB (Recharts)
- **Total Estimated:** ~180-220KB gzipped

### Data Fetching Strategy
- **Caching:** QueryClient configured with default stale times
- **Background Refetch:** Enabled (configurable)
- **Optimistic Updates:** Supported but not yet implemented
- **Pagination:** Not yet implemented (potential bottleneck)

### Code Splitting Opportunities
- ✅ Page components can be lazy-loaded with `React.lazy()`
- ✅ Heavy dialogs (CSV upload) could be code-split
- ✅ Chart rendering is expensive and could be deferred

---

## Deployment & Build Configuration

### Build Tool: Vite
- **Dev Server:** Port 8080 with HMR
- **Build Output:** Optimized ES modules
- **Asset Handling:** Automatic chunking for vendor libraries
- **Environment Variables:** Prefixed with `VITE_` (exposed to frontend)

### Required Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Optional Integration Variables
```env
VITE_DEEPSEEK_API_KEY=     # For AI features
VITE_OPENROUTER_API_KEY=   # For multi-model AI
VITE_EXA_API_KEY=          # For web search
VITE_GITHUB_TOKEN=         # For GitHub operations
```

---

## Integration Points Summary

### External Services
- **Supabase:** Authentication, PostgreSQL database, file storage
- **Lovable:** Component tagging tool (development only)

### Internal Service Dependencies
- **React Query:** All data fetching through custom hooks
- **Supabase Client:** `src/integrations/supabase/client.ts`
- **Auth Context:** Global state for authentication

### Frontend Integrations
- **MFA:** TOTP-based through Supabase Auth AAL2
- **Charts:** Recharts for data visualization
- **Notifications:** Sonner toasts for user feedback
- **Dark Mode:** next-themes with system preference detection

---

## Recommendations for Next Phase

### Quick Wins (Low Effort, High Impact)
1. **Enable stricter TypeScript** - Gradually enable `noImplicitAny` and other checks
2. **Add error boundaries** - Prevent component crashes from breaking entire page
3. **Implement input validation** - Sanitize CSV uploads and form inputs
4. **Add request timeouts** - Prevent hanging API calls

### Medium-Term Improvements
1. **Increase test coverage** - Unit tests for hooks and utilities
2. **Add performance monitoring** - Identify bottlenecks in production
3. **Implement pagination** - Handle large datasets efficiently
4. **Add loading skeletons** - Improve perceived performance

### Strategic Improvements
1. **Implement error logging** - Sentry or similar for production debugging
2. **Add offline support** - Service worker for basic functionality offline
3. **Implement feature flags** - Gradual rollout of new features
4. **Code splitting** - Lazy-load heavy pages/components

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| **Total Components** | 80+ |
| **UI Primitives** | 60+ (shadcn/ui) |
| **Custom Hooks** | 16 |
| **Page Routes** | 13 |
| **Form Dialogs** | 8 |
| **Tech Stack Size** | 35+ dependencies |
| **Identified Debts** | 17 |
| **TypeScript Files** | ~85 |
| **Estimated LOC** | 8,000-10,000 |

---

## Next Steps

**PHASE 1 COMPLETE:** System Architecture documented

**NEXT PHASE:** Database Schema Audit (@data-engineer)
- Analyze schema completeness
- Identify missing indexes
- Review RLS policies
- Document performance bottlenecks

**THEN:** Frontend Specification (@ux-design-expert)
- Document component patterns
- Identify UX inconsistencies
- Review accessibility

---

*Document generated by @architect agent - Brownfield Discovery Phase 1*
*Version: 1.0 | Generated: 2026-02-27*
