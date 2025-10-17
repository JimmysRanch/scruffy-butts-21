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
- **Functionality**: Comprehensive appointment management with multiple calendar views (day/week/month/list), staff assignments, enhanced status workflows (scheduled→confirmed→checked-in→in-progress→ready-for-pickup→completed), pickup notification system with customer acknowledgment tracking, flexible integrated checkout with add-on services/products, payment handling, search and filtering, conflict detection, reminder/confirmation toggles, duplicate appointments, and detailed appointment tracking with check-in/check-out times
- **Purpose**: Core business function - without appointments, there's no revenue. Streamlines the complete service lifecycle from booking through payment and pickup with flexible upsell opportunities
- **Trigger**: Click "New Appointment" button, select date/time in calendar, edit existing appointment, or click ready-for-pickup appointments to initiate checkout
- **Progression**: Select customer → Choose pet → Select service → Assign staff (optional) → Pick date/time → Add notes → Toggle reminders/confirmations → Schedule → Appointment appears in calendar → Status workflow (confirm → check in → start → ready for pickup [sends notification] → customer arrives [acknowledge] → flexible checkout sheet opens [review appointment service → optionally add services/products → adjust quantities → apply discounts/tips → process payment → back button available to return to appointment detail] → complete & mark picked up) → Track throughout lifecycle
- **Success criteria**: Multiple view modes work smoothly, appointments persist with full details, conflict warnings appear, status transitions work correctly, pickup notifications send automatically, customer acknowledgment tracked, checkout sheet maintains consistent UI (no modal switches), ability to add services and retail products during checkout, original appointment service protected from removal but can add unlimited items, back button returns to appointment detail without losing data, payment processing completes transaction with all items, search/filter returns accurate results, staff color-coding displays, past appointments flagged, detailed view shows complete history including payment and pickup status

### Customer & Pet Management
- **Functionality**: Store customer contact info, pet profiles with breed, size, grooming history, special needs, and quick checkout functionality
- **Purpose**: Personalized service and building long-term relationships with seamless payment processing
- **Trigger**: "Add Customer" button, selecting existing customer, or "Quick Checkout" action from customer detail
- **Progression**: Enter customer details → Add pet information → Save profile → Available for future bookings → Quick Checkout slide-out opens [add services/products → process payment] → Transaction completed
- **Success criteria**: Customer/pet data persists, searchable, linked to appointment history, Quick Checkout slide-out sheet maintains UI consistency with appointment checkout

### Service Catalog
- **Functionality**: Predefined grooming services with pricing, duration, and descriptions
- **Purpose**: Standardize offerings and pricing for consistent business operations
- **Trigger**: Creating appointment or managing services
- **Progression**: View service list → Select services for appointment → Calculate total price and time
- **Success criteria**: Services display correctly, pricing calculates automatically

### Dashboard Overview
- **Functionality**: Overview dashboard with key metrics including today's appointments, total customers/pets, and weekly appointments, plus today's schedule with appointment details
- **Purpose**: Quick business health check and daily workflow organization
- **Trigger**: App launch or dashboard navigation
- **Progression**: Load dashboard → Review key metrics → Check today's schedule → Navigate to needed functions via quick navigation cards
- **Success criteria**: Real-time data display, accurate appointment counts, status badges reflect current appointment state, clickable cards navigate to relevant sections

### Point of Sale (POS)
- **Functionality**: Flexible transaction processing integrated throughout the app - available as standalone POS for walk-ins and embedded in appointment checkout for seamless upselling, manage cart with services and products, track all transactions, support multiple payment methods (cash/card/cashapp/chime), generate comprehensive receipts
- **Purpose**: Complete the service delivery cycle by handling payments and generating sales records, maximize revenue through easy add-on sales during appointment pickup
- **Trigger**: Click "POS" tab for walk-in sales, or automatically integrated when checking out appointments (can add products/services to appointment checkout)
- **Progression**: Standalone: Select services/products → Add to cart → Choose customer (optional) → Process payment → Receipt generated | Integrated: During appointment checkout → Click "Add Items" → Select additional services/products → Return to checkout → Complete payment with all items
- **Success criteria**: Payments process correctly for all methods, transactions persist with complete item details, cart management works smoothly, checkout seamlessly integrates with appointments, can add retail products during service checkout, standalone POS works for walk-ins, receipts show all purchased items

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
- **Status Workflows**: Only show valid status transitions based on current state and appointment timing, enforce ready-for-pickup before checkout
- **Search & Filter**: Handle empty search results with helpful messaging, clear all filters button
- **Payment Processing**: Handle payment failures gracefully with retry options and clear error messages, require customer arrival acknowledgment before processing payment
- **Checkout Flow**: Stay within sheet interface (no modal switches), allow back navigation to appointment detail, protect original appointment service from deletion but allow adding unlimited items, show clear item types (service vs product), validate product stock before adding, gracefully handle empty services/products lists
- **Cart Management**: Prevent accidental cart clearing with confirmation dialogs for significant actions
- **Low Stock Alerts**: Prominent notifications when inventory items reach reorder levels
- **Negative Stock**: Prevent stock levels from going negative with validation on usage transactions
- **Date Navigation**: Smooth navigation between dates with today button for quick return to current date
- **Dashboard Metrics**: Handle zero-state gracefully when no data exists yet
- **Pickup Workflow**: Require customer arrival acknowledgment before enabling checkout, prevent skipping ready-for-pickup status, enable easy upselling during pickup with quick add services/products button

## Design Direction
The design should evoke luxury, sophistication, and premium quality through a cutting-edge liquid glass aesthetic. The interface features translucent frosted glass surfaces with sophisticated blur effects, vibrant purple-to-pink gradients that flow through the UI, rich depth created through layered transparency and shadows, and subtle shine effects that catch the eye. Every surface feels like premium liquid glass with smooth animations, creating an expensive, modern, and futuristic experience that's both visually stunning and highly functional.

## Color Selection
Analogous purple-to-pink gradient palette with liquid glass effects - Creating a luxurious, high-tech experience that feels both expensive and cutting-edge.

- **Primary Color**: Deep Purple (oklch(0.65 0.22 280)) - Communicates innovation, luxury, and premium quality with vibrant energy
- **Secondary Colors**: Rich gradient backgrounds from deep blue-purple (oklch(0.15 0.08 280)) through violet to magenta, creating depth and visual interest
- **Accent Color**: Bright Magenta-Pink (oklch(0.70 0.25 310)) - Eye-catching highlight for CTAs and important actions that conveys premium quality and energy
- **Glass Effects**: Translucent surfaces with 40% opacity, 20px blur, and subtle white borders/highlights creating the signature liquid glass appearance
- **Foreground/Background Pairings**:
  - Background (Deep Purple Gradient oklch(0.15 0.08 280)): White text (oklch(0.98 0.01 280)) - Ratio 12.1:1 ✓
  - Card (Glass Purple oklch(0.25 0.06 270 / 0.4)): White text (oklch(0.98 0.01 270)) - Enhanced by backdrop blur ✓  
  - Primary (Vibrant Purple oklch(0.65 0.22 280)): White text (oklch(0.98 0.01 280)) - Ratio 7.2:1 ✓
  - Accent (Bright Magenta oklch(0.70 0.25 310)): White text (oklch(0.98 0.01 310)) - Ratio 6.8:1 ✓

## Font Selection
Sophisticated dual-typeface system combining elegant serif headlines with clean sans-serif body text - Playfair Display for luxurious, attention-commanding headlines paired with Inter for exceptional readability and modern professionalism.

- **Typographic Hierarchy**: 
  - H1 (Page Titles): Playfair Display Bold/32px/tight letter spacing - Luxury and sophistication
  - H2 (Section Headers): Playfair Display Semibold/24px/normal spacing - Elegant hierarchy
  - H3 (Card Titles): Inter Semibold/18px/wide letter spacing - Modern clarity
  - Body (Content): Inter Regular/16px/relaxed line height - Effortless readability
  - Small (Labels): Inter Semibold/14px/wide tracking - Premium detail

## Animations
Smooth, liquid animations that feel fluid and premium - never jarring or slow. Every motion should reinforce the glass-like quality with gentle easing and subtle scale transforms.

- **Purposeful Meaning**: Fluid, eased transitions with gentle blur and scale effects communicate premium quality and cutting-edge technology, making every interaction feel polished and futuristic
- **Hierarchy of Movement**: Smooth hover states with subtle elevation and scale changes (1.02x), elegant sheet/dialog transitions with backdrop blur, refined form feedback with glow effects on focus

## Component Selection
- **Components**: Cards for appointments/customers/transactions/settings/staff/inventory items/report metrics/dashboard stats, Multi-view calendar (day/week/month/list) with tabs for scheduling, Forms for data entry with inline validation, Tables for service lists and inventory, Badges for appointment status colors and stock levels, Shopping cart UI for POS, Switch components for settings toggles and appointment reminders, Tabs for inventory sections and calendar views and report categories, Dialog for appointment creation/editing and metric definitions, Sheet for appointment details sidebar and checkout processes (maintaining UI consistency), Filters panel with search, Charts (bar/line/pie) for visual analytics, Select dropdowns for date ranges and grouping options and payment methods
- **Customizations**: Advanced calendar component with day/week/month/list views, color-coded staff assignments, enhanced appointment status workflow with 8 states (scheduled/confirmed/checked-in/in-progress/ready-for-pickup/completed/cancelled/no-show), pickup notification system with acknowledgment tracking, integrated checkout slide-out sheets for both appointment and quick checkout workflows (ensuring consistent slide-out UX instead of mixed dialog/sheet patterns), conflict detection and warnings, search and filter system, pet avatar placeholders, POS cart with quantity controls, tabbed settings interface, inventory transaction dialogs, low stock alerts, appointment detail drawer with full history, comprehensive reports with KPI cards showing period-over-period changes, staff ranking displays with color indicators, revenue breakdowns by category and payment method, productivity metrics with utilization tracking, simple dashboard with stat cards and today's schedule, checkout flow with customer arrival acknowledgment requirement
- **States**: Buttons show loading states during saves and payment processing, form inputs highlight validation errors, appointments show status colors with visual differentiation (blue/green/purple/orange/yellow/gray/red/amber), payment processing states, settings save confirmation, inventory stock status badges (in stock/low stock/out of stock), past appointment warnings, staff color indicators, reminder/confirmation/pickup notification toggles, metric cards with trend arrows (up/down), chart hover states with tooltips, export button loading states, info dialog open/closed states, dashboard stat cards with hover effects, checkout sheet disabled state until customer acknowledged, pickup notification sent/acknowledged indicators
- **Icon Selection**: Phosphor icons - Calendar/CalendarBlank for scheduling views, User/UserCircle for customers and staff, Dog for pets, Scissors/Package for services, Phone/Envelope for contact, CashRegister/CreditCard for POS and checkout, Money for payment methods, Gear for settings, Bell/BellSlash/BellRinging for notifications and reminders and pickup alerts, Shield for security, Clock/ClockCounterClockwise for time and no-shows, CheckCircle/XCircle for status, MagnifyingGlass for search, Funnel for filters, Plus for new items, PencilSimple for edit, Trash for delete, Copy for duplicate, CaretLeft/CaretRight for navigation, List for list view, WarningCircle for alerts, Check for confirmation and acknowledgment, ChartBar/ChartLineUp for reports and analytics, Info for metric definitions, Download for exports, TrendUp/TrendDown for performance indicators, Star for top performers, ArrowUp/ArrowDown for period changes
- **Spacing**: Consistent 4/6/8 Tailwind spacing scale for tight/medium/loose layouts, dynamic spacing based on compact mode, generous padding in appointment cards for touch targets, compact metric cards in reports
- **Mobile**: Top navigation bar collapses labels on smaller screens, stacked cards on mobile, touch-friendly appointment time slots and calendar days, responsive calendar that adapts view modes, sheet drawer for appointment details and checkout processes, responsive filters panel, responsive POS interface for tablet use, responsive settings tabs, scrollable inventory tables, responsive dashboard with stacked stat cards