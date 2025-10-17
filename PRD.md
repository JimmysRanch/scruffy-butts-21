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
The design should evoke tranquility, oceanic depth, and premium quality through a turquoise liquid glass aesthetic with true dimensional depth. The interface features independent floating panes of illuminated frosted glass, each with sophisticated blur effects and refraction-inspired gradients. Rich cyan and teal-toned backgrounds create ambient aquatic light diffusion, while widgets maintain a consistent turquoise tint with soft glowing edges. Micro-charts with radiant strokes, simulated key lighting from top-left creating highlights, and soft underglows beneath each widget produce the illusion of floating depth. Every surface feels like premium liquid glass suspended in serene aquatic light, creating an immersive, dimensional, and calm experience that's futuristic and refined.

## Color Selection
Turquoise-cyan ambient gradient palette with liquid glass refraction - Creating a serene, oceanic experience with true depth and aquatic light simulation inspired by holographic UIs and ambient refraction.

- **Background Gradient**: Deep Ocean to Teal radial gradient (oklch(0.25 0.15 180) → oklch(0.10 0.06 210) → oklch(0.06 0.03 200)) - Creates ambient aquatic light environment with gentle diffusion
- **Primary Color**: Luminous Turquoise (oklch(0.60 0.20 200)) - Core brand illumination with soft glow effects
- **Secondary Colors**: Turquoise glass variant (200°) - Consistent across all widgets with matching underglow for unified oceanic theme
- **Accent Color**: Bright Cyan (oklch(0.65 0.22 200)) - Glowing highlights for interactive elements with drop-shadow illumination
- **Glass Refraction**: 28-35% opacity backgrounds, 20-24px blur, gradient borders with top-edge highlights simulating key light refraction through curved glass
- **Lighting System**: Top-left key light creates highlights on upper widget edges, soft turquoise underglows (4-16px blur) create floating depth, micro-reflections and inner gradients mimic light bending through water
- **Foreground/Background Pairings**:
  - Background (Deep Ocean oklch(0.08 0.06 200)): White 85% opacity (oklch(0.98 0.01 200 / 0.85)) - Crisp, legible, premium ✓
  - Glass Widgets (Turquoise Tint ~28-32% opacity): White 90% for headers (oklch(0.98 0.01 / 0.90)), White 60% for body (oklch(0.98 0.01 / 0.60)) - Enhanced by blur and glow ✓  
  - Primary (Luminous Turquoise oklch(0.60 0.20 200)): White text with glow effects - Ratio 8.1:1 ✓
  - Accent (Bright Cyan oklch(0.65 0.22 200)): White text with shadow glow - Ratio 7.5:1 ✓

## Font Selection
Sophisticated dual-typeface system combining elegant serif headlines with clean sans-serif body text - Playfair Display for luxurious, attention-commanding headlines paired with Inter for exceptional readability and modern professionalism.

- **Typographic Hierarchy**: 
  - H1 (Page Titles): Playfair Display Bold/32px/tight letter spacing - Luxury and sophistication
  - H2 (Section Headers): Playfair Display Semibold/24px/normal spacing - Elegant hierarchy
  - H3 (Card Titles): Inter Semibold/18px/wide letter spacing - Modern clarity
  - Body (Content): Inter Regular/16px/relaxed line height - Effortless readability
  - Small (Labels): Inter Semibold/14px/wide tracking - Premium detail

## Animations
Smooth, liquid-light animations with true depth and refraction - Every motion simulates light moving through glass with gentle physics and soft illumination effects.

- **Purposeful Meaning**: Fluid transitions with gentle scale (1.02x), subtle glow intensification, and refined blur shifts communicate premium quality and cutting-edge technology. Hover states increase underglow intensity and border luminosity, simulating light catching on glass surfaces with aquatic shimmer
- **Hierarchy of Movement**: Micro-interactions on widgets with scale and turquoise glow (400ms cubic-bezier), elegant sheet transitions with backdrop blur fade-in (300ms), form focus states with radiant cyan ring glow (200ms), chart animations with progressive reveal and soft stroking effects

## Component Selection
- **Components**: Turquoise glass-morphic cards for appointments/customers/transactions/settings/staff/inventory items/report metrics/dashboard stats, each with top-edge highlights and bottom cyan underglows. Multi-view calendar (day/week/month/list) with tabs for scheduling, Forms with radiant turquoise focus rings, Tables with frosted row backgrounds, Glowing badges for appointment status, Shopping cart with glass panels, Illuminated switches and toggles, Tabs with light-catching active states, Dialogs with deep backdrop blur, Sheets with gradient borders, Filters with soft cyan glow, Micro-charts (progress arcs, bar fills, glowing sparklines) with radiant turquoise strokes
- **Customizations**: Unified turquoise liquid glass widgets system with consistent color (200°), custom CSS variables for gradients, borders, shadows, and cyan underglows. Advanced calendar with floating glass date cells, Enhanced appointment status with glowing badges, Integrated checkout sheets with consistent glass aesthetic, Conflict detection with pulsing warning glow, POS cart with translucent item cards, Dashboard stat widgets with embedded micro-charts (sparklines with 2.5px strokes, mini bar charts with cyan glow, progress arcs with radial illumination), Reports with holographic KPI cards and luminous turquoise trend indicators
- **States**: Buttons show pulsing cyan glow on loading, Inputs have radiant focus rings with turquoise color glow, Appointments display status with colored illuminated badges, Glass widgets scale and intensify underglow on hover (translateY(-4px) with increased shadow spread), Charts animate strokes with progressive glow reveal, Metric cards show trend with glowing arrows, Dashboard widgets have smooth hover elevation with enhanced turquoise border luminosity
- **Icon Selection**: Phosphor icons with duotone weight for depth - All icons enhanced with matching turquoise drop-shadow glows (0_0_4-8px with cyan accent). Calendar/CalendarBlank for scheduling, User/UserCircle for customers, Dog for pets, Scissors/Package for services, Phone/Envelope for contact, CashRegister/CreditCard for POS, Money/TrendUp/TrendDown with glows for financial indicators, Gear for settings, Bell/BellRinging with pulsing glow for notifications, Clock/ClockCounterClockwise for time tracking, CheckCircle/XCircle with status-colored glows, ChartBar/ChartLineUp with data visualization glow effects
- **Spacing**: Increased spacing for floating depth perception - 4px gaps between micro-elements, 16px padding within glass cards, 24px gaps between major floating widgets, Generous touch targets with invisible padding halos for accessibility
- **Mobile**: Glass navigation adapts with reduced blur on low-power devices, Widgets stack vertically maintaining turquoise tint and glows, Touch targets expand to 44px minimum with generous tap zones, Sheets and dialogs maintain full glass treatment with optimized blur for performance, Micro-charts scale proportionally preserving glow effects