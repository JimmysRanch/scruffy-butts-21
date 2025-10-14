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
- **Functionality**: Book, view, edit, and cancel grooming appointments with time slots, services, and customer details
- **Purpose**: Core business function - without appointments, there's no revenue
- **Trigger**: Click "New Appointment" or calendar time slot
- **Progression**: Select date/time → Choose customer/pet → Select services → Add notes → Confirm booking → Calendar updated
- **Success criteria**: Appointments persist, show in calendar view, prevent double-booking

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
- **Functionality**: Today's schedule, upcoming appointments, recent customers, revenue summary
- **Purpose**: Quick business health check and daily workflow organization
- **Trigger**: App launch or dashboard navigation
- **Progression**: Load dashboard → Review today's appointments → Check recent activity → Navigate to needed functions
- **Success criteria**: Real-time data display, intuitive navigation to other features

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
- **Functionality**: Manage team member profiles, contact information, specialties, and employment details
- **Purpose**: Organize staff information and track team member capabilities for optimal assignment and management
- **Trigger**: Click "Staff" tab or staff member name
- **Progression**: View staff list → Click member name → View profile details → Edit if needed → Save changes
- **Success criteria**: Staff profiles persist, searchable/filterable list, detailed individual profiles with complete information

### Inventory Management
- **Functionality**: Track grooming supplies, shampoos, conditioners, tools, and products with stock levels, reorder alerts, suppliers, and transaction history
- **Purpose**: Prevent stockouts, optimize purchasing, control costs, and maintain adequate supplies for smooth salon operations
- **Trigger**: Click "Inventory" tab in navigation
- **Progression**: View inventory items → Check stock levels → Add new items/suppliers → Record usage/restocking → Monitor low stock alerts → Generate orders
- **Success criteria**: Real-time stock tracking, automatic low-stock alerts, transaction history, supplier management, category organization, cost tracking

### Reports & Analytics
- **Functionality**: Generate comprehensive business reports with revenue metrics, appointment analytics, service performance, staff metrics, customer insights, and peak hours analysis with PDF and CSV export capabilities
- **Purpose**: Provide data-driven insights to optimize business performance, identify trends, track growth, and make informed decisions
- **Trigger**: Click "Reports" tab in navigation
- **Progression**: View dashboard → Select date range/filters → Review metrics and charts → Export reports as PDF or CSV → Share with stakeholders
- **Success criteria**: All metrics calculate correctly, filters work properly, data visualizations are accurate, export formats are professional and complete, handles empty states gracefully

## Edge Case Handling
- **Empty States**: Helpful guidance when no appointments, customers, services, staff, transactions, or inventory items exist yet
- **Scheduling Conflicts**: Prevent double-booking with clear error messages and alternative suggestions
- **Missing Information**: Handle incomplete customer/pet profiles gracefully with optional field validation
- **Long Names/Text**: Truncate and tooltip for lengthy pet names, customer notes, service descriptions, or product names
- **Mobile Usage**: Responsive design for groomers using tablets/phones in the salon
- **Payment Processing**: Handle payment failures gracefully with retry options and clear error messages
- **Cart Management**: Prevent accidental cart clearing with confirmation dialogs for significant actions
- **Low Stock Alerts**: Prominent notifications when inventory items reach reorder levels
- **Negative Stock**: Prevent stock levels from going negative with validation on usage transactions
- **Empty Reports**: Display helpful messages when no data exists for selected filters or date ranges
- **Division by Zero**: Handle zero-count metrics gracefully in percentage calculations and averages
- **Export Errors**: Graceful error handling for PDF/CSV exports with user-friendly error messages

## Design Direction
The design should feel professional yet warm - like a high-end veterinary clinic that genuinely loves animals. Clean, spacious interface with subtle pet-themed touches that don't compromise the business-focused functionality.

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
- **Components**: Cards for appointments/customers/transactions/settings/staff/inventory items and reports metrics, Calendar for scheduling, Forms for data entry, Tables for service lists and inventory and reports, Badges for appointment status and stock levels and report tags, Shopping cart UI for POS, Switch components for settings toggles, Tabs for inventory sections and reports sections, Select dropdowns for report filters and date ranges, Popover calendars for custom date selection
- **Customizations**: Custom calendar component optimized for daily/weekly appointment views, pet avatar placeholders, POS cart with quantity controls, tabbed settings interface, inventory transaction dialogs, low stock alerts, report visualization widgets with progress bars and trend indicators, PDF/CSV export functionality
- **States**: Buttons show loading states during saves, form inputs highlight validation errors, appointments show status colors, payment processing states, settings save confirmation, inventory stock status badges (in stock/low stock/out of stock), report export processing states
- **Icon Selection**: Phosphor icons - Calendar for scheduling, User for customers, Scissors for services, Phone for contact, CashRegister for POS, CreditCard/Money for payment methods, Gear for settings, Bell for notifications, Shield for security, UserCircle for staff management, Package for inventory, TrendUp/TrendDown for stock changes and growth metrics, Warning for low stock, ShoppingCart for reorders, ChartBar for analytics, Download for exports, FilePdf/FileCsv for export formats, CurrencyDollar for revenue, Clock for peak times, Dog for grooming services, Star for top customers
- **Spacing**: Consistent 4/6/8 Tailwind spacing scale for tight/medium/loose layouts
- **Mobile**: Collapsible sidebar navigation, stacked cards on mobile, touch-friendly appointment time slots, responsive POS interface for tablet use, responsive settings tabs, scrollable inventory tables, scrollable inventory tables