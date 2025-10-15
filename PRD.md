# Scruffy Butts - Dog Grooming Management App

A comprehensive digital solution for professional dog groomers to manage appointments, track customer pets, and streamline their business operations.

**Experience Qualities**: 
1. **Professional** - Clean, trustworthy interface that reflects the care and precision of professional grooming
2. **Efficient** - Streamlined workflows that save time and reduce administrative burden
3. **Caring** - Warm, pet-friendly design that shows love for animals while maintaining professionalism

**Complexity Level**: Light Application (multiple features with basic state)
- Multiple interconnected features (scheduling, customers, services) with persistent data storage and basic business logic flows

## Essential Features

### Appointment Scheduling
- **Functionality**: Comprehensive appointment management with multiple calendar views (day/week/month/list), staff assignments, status workflows (scheduled→confirmed→checked-in→in-progress→completed), search and filtering, conflict detection, reminder/confirmation toggles, duplicate appointments, and detailed appointment tracking with check-in/check-out times
- **Purpose**: Core business function - without appointments, there's no revenue. Must compete with industry leaders like MoeGo and DaySmart
- **Trigger**: Click "New Appointment" button, select date/time in calendar, or edit existing appointment
- **Progression**: Select customer → Choose pet → Select service → Assign staff (optional) → Pick date/time → Add notes → Toggle reminders/confirmations → Schedule → Appointment appears in calendar → Status workflow (confirm → check in → start → complete) → Track throughout lifecycle
- **Success criteria**: Multiple view modes work smoothly, appointments persist with full details, conflict warnings appear, status transitions work correctly, search/filter returns accurate results, staff color-coding displays, past appointments flagged, detailed view shows complete history

### Customer & Pet Management
- **Functionality**: Store customer contact info, pet profiles with breed, size, grooming history, and special needs
- **Purpose**: Personalized service and building long-term relationships
- **Trigger**: "Add Customer" button or selecting existing customer
- **Progression**: Enter customer details → Add pet information → Save profile → Available for future bookings
- **Success criteria**: Customer/pet data persists, searchable, linked to appointment history

### Service Catalog
- **Functionality**: Predefined grooming services with pricing, duration, and descriptions
- **Purpose**: Standardize offerings and pricing for consistent business operations
- **Trigger**: Creating appointment or managing services
- **Progression**: View service list → Select services for appointment → Calculate total price and time
- **Success criteria**: Services display correctly, pricing calculates automatically

### Dashboard Overview
- **Functionality**: Customizable widget-based dashboard with drag-and-drop layout, including today's schedule, upcoming appointments, recent customers, revenue summary, activity feed, quick actions, and various stat widgets
- **Purpose**: Quick business health check and daily workflow organization with personalized layout
- **Trigger**: App launch or dashboard navigation
- **Progression**: Load dashboard → Review widgets → Customize layout (optional) → Drag/resize widgets → Toggle widgets on/off → Check activity feed → Navigate to needed functions
- **Success criteria**: Real-time data display, persistent widget configuration, smooth drag-and-drop interaction, activity feed shows recent team actions (appointments completed, payments processed, customers added)

### Point of Sale (POS)
- **Functionality**: Process payments for services, manage cart, track transactions, support cash/card payments
- **Purpose**: Complete the service delivery cycle by handling payments and generating sales records
- **Trigger**: Click "POS" tab or complete service delivery
- **Progression**: Select services → Add to cart → Choose customer (optional) → Select payment method → Process payment → Receipt generated
- **Success criteria**: Payments process correctly, transactions persist, cart management works smoothly

### Settings Management
- **Functionality**: Configure business information, notification preferences, appearance settings, and security options
- **Purpose**: Customize the application to match business needs and personal preferences
- **Trigger**: Click "Settings" tab in navigation
- **Progression**: Navigate settings tabs → Update business details/preferences → Save changes → Settings applied
- **Success criteria**: Settings persist between sessions, business information displays throughout app, notifications work as configured

### Staff Management
- **Functionality**: Manage team member profiles, contact information, specialties, employment details, comprehensive scheduling with calendar view, regular shifts, time-off requests, and comprehensive performance reporting with detailed metrics and charts
- **Purpose**: Organize staff information, track team member capabilities for optimal assignment, manage schedules efficiently, and analyze performance to improve business operations
- **Trigger**: Click "Staff" tab or staff member name, navigate to schedule calendar, or access Reports for performance analysis
- **Progression**: View staff list → Click member name → View profile details → Edit if needed → Save changes → Manage schedules via calendar → Set regular schedules or single shifts → Request time off → Access Reports for detailed performance metrics → Filter by date range and staff member → View KPIs, charts, and breakdowns
- **Success criteria**: Staff profiles persist, searchable/filterable list, detailed individual profiles with complete information, schedule calendar displays shifts correctly, regular schedules populate calendar view, time-off requests are tracked, services bookability is configured per staff member, comprehensive performance reports with revenue, appointments, efficiency metrics, and actionable insights

### Reports & Analytics
- **Functionality**: Comprehensive Groomer Stats reporting with staff rankings, revenue metrics (total/net/category/payment method breakdown), productivity metrics (appointments completed, utilization rate, service duration), client behavior tracking (rebook rate, retention, no-shows), financial indicators (tips, discounts, product sales), time-range filtering, comparison to previous periods, drill-down capabilities, and export functionality (CSV/PDF)
- **Purpose**: Provide data-driven insights for business decisions, track staff performance with rankings and growth metrics, identify trends and opportunities, monitor key performance indicators with period-over-period comparisons
- **Trigger**: Click "Reports" tab in navigation
- **Progression**: Select date range (today/yesterday/week/month) → Choose staff filter (all or individual) → Select grouping (staff/service/payment) → View KPI cards with trend indicators → Explore tabs (rankings/revenue/productivity/client behavior) → Click info icons for metric definitions → Export reports as CSV or PDF
- **Success criteria**: All metrics calculate correctly from appointment and transaction data, period comparisons show accurate percentage changes, charts and visualizations display properly, staff rankings order correctly by net sales, payment method breakdown reflects all methods (cash/card/cashapp/chime), export functions generate files, metric definition dialogs provide clear explanations, live refresh updates data hourly

### Inventory Management
- **Functionality**: Track grooming supplies, shampoos, conditioners, tools, and products with stock levels, reorder alerts, suppliers, and transaction history
- **Purpose**: Prevent stockouts, optimize purchasing, control costs, and maintain adequate supplies for smooth salon operations
- **Trigger**: Click "Inventory" tab in navigation
- **Progression**: View inventory items → Check stock levels → Add new items/suppliers → Record usage/restocking → Monitor low stock alerts → Generate orders
- **Success criteria**: Real-time stock tracking, automatic low-stock alerts, transaction history, supplier management, category organization, cost tracking

## Edge Case Handling
- **Empty States**: Helpful guidance when no appointments, customers, services, staff, transactions, or inventory items exist yet, with prominent CTAs to create first items
- **Scheduling Conflicts**: Detect time slot conflicts and show warnings when staff member already has appointment at selected time
- **Past Appointments**: Flag appointments in the past that haven't been marked completed/cancelled/no-show with warning badges
- **Missing Information**: Handle incomplete customer/pet profiles gracefully with optional field validation, allow unassigned staff on appointments
- **Long Names/Text**: Truncate and tooltip for lengthy pet names, customer notes, service descriptions, or product names in compact views
- **Mobile Usage**: Responsive design for groomers using tablets/phones in the salon, touch-friendly calendar navigation
- **Multiple View Modes**: Gracefully transition between day/week/month/list views maintaining date context and filters
- **Status Workflows**: Only show valid status transitions based on current state and appointment timing
- **Search & Filter**: Handle empty search results with helpful messaging, clear all filters button
- **Payment Processing**: Handle payment failures gracefully with retry options and clear error messages
- **Cart Management**: Prevent accidental cart clearing with confirmation dialogs for significant actions
- **Low Stock Alerts**: Prominent notifications when inventory items reach reorder levels
- **Negative Stock**: Prevent stock levels from going negative with validation on usage transactions
- **Date Navigation**: Smooth navigation between dates with today button for quick return to current date

## Design Direction
The design should feel professional yet warm with a modern **liquid glass aesthetic** - like a high-end veterinary clinic that genuinely loves animals. The interface features glassmorphic elements with frosted glass effects, backdrop blur, subtle gradients, and translucent surfaces that create depth and sophistication while maintaining the business-focused functionality. The liquid glass design provides a premium, modern feel with smooth animations and layered transparency effects.

## Color Selection
Complementary (opposite colors) - Calming blues paired with warm oranges to balance professionalism with warmth and energy.

- **Primary Color**: Deep Blue (oklch(0.45 0.12 250)) - Communicates trust, professionalism, and reliability
- **Secondary Colors**: Light Blue (oklch(0.85 0.06 250)) for backgrounds and Warm Gray (oklch(0.75 0.02 50)) for supporting elements  
- **Accent Color**: Warm Orange (oklch(0.65 0.15 50)) - Friendly, energetic highlight for CTAs and important actions
- **Foreground/Background Pairings**:
  - Background (Light Blue oklch(0.95 0.02 250)): Dark Blue text (oklch(0.25 0.08 250)) - Ratio 8.2:1 ✓
  - Card (White oklch(1 0 0)): Dark Blue text (oklch(0.25 0.08 250)) - Ratio 12.1:1 ✓  
  - Primary (Deep Blue oklch(0.45 0.12 250)): White text (oklch(1 0 0)) - Ratio 7.8:1 ✓
  - Accent (Warm Orange oklch(0.65 0.15 50)): White text (oklch(1 0 0)) - Ratio 4.9:1 ✓

## Font Selection
Clean, professional sans-serif that conveys both reliability and approachability - Inter for its excellent readability and modern feel.

- **Typographic Hierarchy**: 
  - H1 (Page Titles): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter Semibold/24px/normal spacing  
  - H3 (Card Titles): Inter Medium/18px/normal spacing
  - Body (Content): Inter Regular/16px/relaxed line height
  - Small (Labels): Inter Medium/14px/tight spacing

## Animations
Subtle, purposeful animations that guide user attention and provide feedback without feeling playful or distracting from the professional context.

- **Purposeful Meaning**: Smooth transitions communicate care and attention to detail, reflecting grooming precision
- **Hierarchy of Movement**: Priority on form feedback and navigation transitions, minimal decorative animation

## Component Selection
- **Components**: Cards for appointments/customers/transactions/settings/staff/inventory items/report metrics, Multi-view calendar (day/week/month/list) with tabs for scheduling, Forms for data entry with inline validation, Tables for service lists and inventory, Badges for appointment status colors and stock levels, Shopping cart UI for POS, Switch components for settings toggles and appointment reminders, Tabs for inventory sections and calendar views and report categories, Drag-and-drop grid layout for dashboard widgets, Dialog for appointment creation/editing and metric definitions, Sheet for appointment details sidebar, Filters panel with search, Charts (bar/line/pie) for visual analytics, Select dropdowns for date ranges and grouping options
- **Customizations**: Advanced calendar component with day/week/month/list views, color-coded staff assignments, appointment status workflow with 7 states (scheduled/confirmed/checked-in/in-progress/completed/cancelled/no-show), conflict detection and warnings, search and filter system, pet avatar placeholders, POS cart with quantity controls, tabbed settings interface, inventory transaction dialogs, low stock alerts, draggable/resizable dashboard widgets with configuration dialog, activity feed with real-time updates, appointment detail drawer with full history, comprehensive reports with KPI cards showing period-over-period changes, staff ranking displays with color indicators, revenue breakdowns by category and payment method, productivity metrics with utilization tracking
- **States**: Buttons show loading states during saves, form inputs highlight validation errors, appointments show status colors with visual differentiation (blue/green/purple/orange/gray/red/amber), payment processing states, settings save confirmation, inventory stock status badges (in stock/low stock/out of stock), widget drag states with visual placeholders, widget enable/disable states, past appointment warnings, staff color indicators, reminder/confirmation toggles, metric cards with trend arrows (up/down), chart hover states with tooltips, export button loading states, info dialog open/closed states
- **Icon Selection**: Phosphor icons - Calendar/CalendarBlank for scheduling views, User/UserCircle for customers and staff, Dog for pets, Scissors/Package for services, Phone/Envelope for contact, CashRegister for POS, CreditCard/Money for payment methods, Gear for settings, Bell/BellSlash for notifications and reminders, Shield for security, Clock/ClockCounterClockwise for time and no-shows, CheckCircle/XCircle for status, MagnifyingGlass for search, Funnel for filters, Plus for new items, PencilSimple for edit, Trash for delete, Copy for duplicate, CaretLeft/CaretRight for navigation, List for list view, WarningCircle for alerts, Check for confirmation, ChartBar/ChartLineUp for reports and analytics, Info for metric definitions, Download for exports, TrendUp/TrendDown for performance indicators, Star for top performers, ArrowUp/ArrowDown for period changes
- **Spacing**: Consistent 4/6/8 Tailwind spacing scale for tight/medium/loose layouts, dynamic spacing in grid layout based on compact mode, generous padding in appointment cards for touch targets, compact metric cards in reports
- **Mobile**: Collapsible sidebar navigation, stacked cards on mobile, touch-friendly appointment time slots and calendar days, responsive calendar that adapts view modes, sheet drawer for appointment details, responsive filters panel, responsive POS interface for tablet use, responsive settings tabs, scrollable inventory tables, responsive dashboard grid that adapts to smaller screens, responsive report layouts with stacked charts and metrics