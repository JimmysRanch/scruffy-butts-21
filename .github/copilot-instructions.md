# Copilot Instructions for Scruffy Butts

## Project Overview

Scruffy Butts is a comprehensive dog grooming management Progressive Web App (PWA) built with React 19, TypeScript, and Next.js. The application helps professional dog groomers manage appointments, track customer pets, process payments, manage staff, track inventory, and analyze business performance.

**Tech Stack:**
- **Frontend Framework:** React 19 with TypeScript
- **Build Tool:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS 4.1.14 with custom liquid glass aesthetic
- **UI Components:** Radix UI primitives with custom theming
- **State Management:** React hooks and React Query (TanStack Query)
- **Icons:** Phosphor Icons (duotone weight)
- **GitHub Spark:** Custom development framework (@github/spark)

## Build, Lint, and Test Instructions

### Building the Application
```bash
npm run build
```
This runs Next.js build process. The output goes to the `.next` directory.

### Development Server
```bash
npm run dev
```
Starts Next.js dev server, typically on port 3000.

### Linting
```bash
npm run lint
```
Runs ESLint to check code quality. Fix any linting errors before committing.

### Production Server
```bash
npm run start
```
Serves the Next.js production build.

### Package Management
- Use `npm install` to add dependencies
- The project uses npm workspaces (see `package.json`)
- Lock file: `package-lock.json` (commit changes to this file)

## Code Style and Architecture Guidelines

### File Organization
- **App directory:** `/app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with fonts and global setup
  - `page.tsx` - Home page
- **Components:** `/src/components/` - React components
  - Main feature components (e.g., `Dashboard.tsx`, `AppointmentScheduler.tsx`)
  - UI primitives: `/src/components/ui/` (shadcn/ui style components)
  - Widgets: `/src/components/widgets/` (dashboard widgets)
- **Hooks:** `/src/hooks/` - Custom React hooks
- **Library utilities:** `/src/lib/` - Shared utilities and helpers
- **Styles:** `/src/styles/` - Global styles and theme configuration
- **Assets:** `/src/assets/` - Images, icons, and static files

### TypeScript Guidelines
- **Strict null checks enabled** - Always handle null/undefined cases
- **No implicit any** - Explicitly type all variables and functions
- **Use type inference** where appropriate, but add explicit types for function parameters and return values
- **Path aliases:** Use `@/` prefix for imports (e.g., `import { Button } from '@/components/ui/button'`)
- **Module resolution:** Set to "bundler" mode
- **React 19 types:** Use types from `@types/react` v19

### Component Patterns
1. **Functional Components:** Always use function components with hooks
2. **Props typing:** Define explicit prop interfaces
3. **File naming:** PascalCase for components (e.g., `AppointmentScheduler.tsx`)
4. **Export pattern:** Prefer named exports for utilities, default exports acceptable for components
5. **Error boundaries:** Wrap components that may error with ErrorBoundary
6. **Data fetching:** Use React Query (@tanstack/react-query) for server state

### State Management
- **Local state:** `useState` for component-level state
- **Side effects:** `useEffect` with proper dependencies
- **Server state:** React Query for API calls and caching
- **Form state:** React Hook Form with Zod validation (@hookform/resolvers)
- **Context:** Use React Context sparingly for truly global state (theme, auth, etc.)

### Styling Guidelines
- **Use Tailwind CSS** for all styling
- **Custom theme:** The app uses a liquid glass aesthetic with:
  - Purple/lavender gradients for backgrounds (hue 240°)
  - Glass-morphic cards with blur effects (20-24px blur, 28-35% opacity)
  - Color system based on CSS variables (see `/src/index.css`)
  - Soft glowing effects with drop shadows and underglows
  - Top-left key lighting simulation
- **Typography:**
  - Playfair Display for headlines (H1, H2)
  - Inter for body text and UI elements
- **Components:** Use Radix UI primitives, customized with Tailwind
- **Class naming:** Use Tailwind utilities, avoid custom CSS classes when possible
- **Dark mode:** Theme system uses `[data-appearance="dark"]` selector (see `tailwind.config.js`)

### Icon Usage
- **Use Phosphor Icons** (`@phosphor-icons/react`)
- **Weight:** Duotone for depth effects
- **Enhancement:** Icons can have drop-shadow glows for visual consistency
- **Common icons:**
  - Calendar for scheduling
  - User/UserCircle for customers
  - Dog for pets
  - Scissors/Package for services
  - CashRegister for POS
  - ChartBar for analytics

## Design System

### Color Palette (Liquid Glass with Purple/Lavender Hue)

The color system uses CSS variables defined in `/src/index.css`. All colors use hue 240° (purple/lavender):

```css
/* Primary Colors (from :root in src/index.css) */
--background: oklch(0.12 0.08 240);
--foreground: oklch(0.98 0.01 240);
--primary: oklch(0.60 0.20 240);
--accent: oklch(0.65 0.22 240);
--card: oklch(0.20 0.08 240 / 0.35);

/* Glass Effects */
--glass-opacity: 0.28-0.35;
--glass-blur: 20-24px;
--glow-blur: 4-16px;
```

**Important:** Use the Tailwind color classes (e.g., `bg-primary`, `text-accent`, `border-border`) rather than direct OKLCH values. The Tailwind config maps these to CSS variables via `tailwind.config.js`.

### Component States
- **Hover:** Scale (1.02x), increased glow, enhanced border luminosity, translateY(-4px)
- **Focus:** Radiant cyan ring glow (200ms)
- **Loading:** Pulsing cyan glow on buttons
- **Active:** Glowing badges for status indicators

### Animation Principles
- **Timing:** Fluid transitions (200-400ms cubic-bezier)
- **Scale:** Gentle (1.02x maximum)
- **Physics:** Simulate light moving through glass
- **Glow effects:** Progressive intensity changes
- **Sheet transitions:** 300ms with backdrop blur fade-in

## Feature-Specific Guidelines

### Appointments
- Support multiple calendar views: day/week/month/list
- Status workflow: scheduled → confirmed → checked-in → in-progress → ready-for-pickup → completed
- Conflict detection for double-booking
- Staff color-coding in calendar
- Pickup notifications with customer acknowledgment
- Integrated checkout with ability to add services/products

### Customer & Pet Management
- Link pets to customers (one-to-many relationship)
- Store grooming history and special needs
- Quick checkout functionality from customer detail
- Searchable and filterable lists

### Point of Sale (POS)
- Support standalone walk-in sales
- Integrate with appointment checkout
- Multiple payment methods: cash, card, CashApp, Chime
- Cart management with services and products
- Receipt generation

### Staff Management
- Profile with contact info and specialties
- Calendar-based scheduling with regular shifts
- Time-off request tracking
- Service bookability configuration per staff member
- Performance metrics and reporting

### Inventory Management
- Track stock levels for supplies and products
- Low-stock alerts and reorder points
- Supplier management
- Transaction history (usage/restocking)
- Category organization

### Reports & Analytics
- Groomer stats with rankings
- Revenue metrics (total/net/category/payment method breakdown)
- Productivity metrics (utilization rate, service duration)
- Client behavior tracking (rebook rate, retention, no-shows)
- Time-range filtering with period comparisons
- Export to CSV/PDF

## Common Pitfalls to Avoid

1. **Don't break the glass aesthetic** - All new UI components should follow the liquid glass design (purple/lavender hue)
2. **Don't add inline styles** - Use Tailwind classes exclusively
3. **Don't skip TypeScript types** - Always type props, state, and function signatures
4. **Don't bypass form validation** - Use React Hook Form with Zod schemas
5. **Don't create custom CSS files** - Extend Tailwind config if needed
6. **Don't ignore accessibility** - Maintain ARIA labels and keyboard navigation
7. **Don't commit build artifacts** - The `.next` folder is gitignored
8. **Don't use client-side only features in Server Components** - Mark components with 'use client' when needed

## Working with Forms

Use React Hook Form + Zod for all forms:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  // ... more fields
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '' }
});
```

## Data Persistence

- **Local storage** for user preferences and settings
- **IndexedDB or localStorage** for application data (appointments, customers, etc.)
- **No backend currently** - This is a local-first PWA
- **Data structure:** Plan for future backend integration

## PWA Configuration

- **Manifest:** `/manifest.json` - App metadata for installation
- **Service Worker:** `/sw.js` - Offline functionality and caching
- **Icons:** Generated from `/icon.svg` using `/generate-icons.html`
- **Install prompt:** Custom PWA install component (`PWAInstallPrompt.tsx`)

## Testing Guidelines

Currently, no test infrastructure exists in this repository. If adding tests:
- Use Jest or Vitest (compatible with Next.js)
- Test utilities: React Testing Library
- Test file naming: `*.test.tsx` or `*.spec.tsx`
- Place tests next to components or in `__tests__` folders

## Git and Commit Guidelines

- Write clear, descriptive commit messages
- Reference issue numbers when applicable
- Keep commits focused and atomic
- Don't commit `node_modules` or `dist` directories
- Review `.gitignore` before adding new file types

## Environment and Configuration

- **Runtime config:** `/runtime.config.json` - Application configuration
- **Theme config:** `/theme.json` - Theme customization
- **Tailwind config:** `/tailwind.config.js` - Tailwind CSS configuration
- **TypeScript config:** `/tsconfig.json` - TypeScript compiler options
- **Next.js config:** `/next.config.mjs` - Next.js build configuration
- **PostCSS config:** `/postcss.config.js` - PostCSS configuration for Tailwind

## Dependencies to Check Before Adding

Before adding new npm packages:
1. Check if functionality exists in current dependencies (many UI primitives from Radix UI)
2. Ensure compatibility with React 19
3. Verify package is actively maintained
4. Consider bundle size impact
5. Check for security vulnerabilities

## Best Practices for AI-Generated Code

1. **Read PRD.md first** - Understand the full product vision and feature requirements
2. **Follow the design direction** - Maintain the liquid glass aesthetic with purple/lavender hue (240°)
3. **Keep changes minimal** - Make surgical, focused modifications
4. **Test interactively** - Run `npm run dev` and manually test changes in browser
5. **Validate types** - Run `npm run build` to catch TypeScript errors
6. **Check edge cases** - Review empty states, long text, mobile responsiveness
7. **Maintain consistency** - Match existing patterns and component styles
8. **Document complex logic** - Add comments for non-obvious business logic
9. **Preserve working code** - Don't refactor code that isn't related to the task
10. **Ask for clarification** - If requirements are ambiguous, ask before implementing

## Key Files to Reference

- **PRD.md** - Product requirements and feature specifications
- **PWA-SETUP.md** - Progressive Web App setup documentation
- **SECURITY.md** - Security policies and guidelines
- **CLEANUP_NEEDED.md** - Known technical debt and cleanup tasks
- **MIGRATION.md** - Next.js migration documentation
- **package.json** - Dependencies and npm scripts
- **app/page.tsx** - Main application entry point
- **app/layout.tsx** - Root layout with fonts and global setup
- **src/App.tsx** - Main application component and routing
- **src/components/Navigation.tsx** - App navigation structure

## Support and Resources

- **GitHub Spark Docs:** Check `@github/spark` documentation for framework-specific features
- **Radix UI Docs:** https://www.radix-ui.com/primitives/docs/overview/introduction
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **React Query Docs:** https://tanstack.com/query/latest
- **Phosphor Icons:** https://phosphoricons.com/
