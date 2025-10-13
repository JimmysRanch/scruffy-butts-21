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

## Edge Case Handling
- **Empty States**: Helpful guidance when no appointments, customers, services, staff, or transactions exist yet
- **Scheduling Conflicts**: Prevent double-booking with clear error messages and alternative suggestions
- **Missing Information**: Handle incomplete customer/pet profiles gracefully with optional field validation
- **Long Names/Text**: Truncate and tooltip for lengthy pet names, customer notes, or service descriptions
- **Mobile Usage**: Responsive design for groomers using tablets/phones in the salon
- **Payment Processing**: Handle payment failures gracefully with retry options and clear error messages
- **Cart Management**: Prevent accidental cart clearing with confirmation dialogs for significant actions

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
- **Components**: Cards for appointments/customers/transactions/settings/staff, Calendar for scheduling, Forms for data entry, Tables for service lists, Badges for appointment status, Shopping cart UI for POS, Switch components for settings toggles
- **Customizations**: Custom calendar component optimized for daily/weekly appointment views, pet avatar placeholders, POS cart with quantity controls, tabbed settings interface
- **States**: Buttons show loading states during saves, form inputs highlight validation errors, appointments show status colors, payment processing states, settings save confirmation
- **Icon Selection**: Phosphor icons - Calendar for scheduling, User for customers, Scissors for services, Phone for contact, CashRegister for POS, CreditCard/Money for payment methods, Gear for settings, Bell for notifications, Shield for security, UserCircle for staff management
- **Spacing**: Consistent 4/6/8 Tailwind spacing scale for tight/medium/loose layouts
- **Mobile**: Collapsible sidebar navigation, stacked cards on mobile, touch-friendly appointment time slots, responsive POS interface for tablet use, responsive settings tabs