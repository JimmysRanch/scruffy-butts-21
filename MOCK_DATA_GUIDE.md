# Mock Data Seeding Guide

## Overview
A comprehensive mock data seeding system has been added to populate the Scruffy Butts app with realistic test data covering the date range **October 15, 2025 - November 15, 2025** (32 days).

## How to Use

1. **Navigate to Settings**
   - Click on "Settings" in the navigation menu

2. **Go to Security Tab**
   - Click on the "Security" tab in Settings

3. **Seed the Data**
   - Scroll down to "Comprehensive Mock Data (Oct 15 - Nov 15, 2025)"
   - Click the "Seed Complete App Data" button
   - Wait for success message
   - Page will automatically reload with all the new data

## What Gets Seeded

### Staff Members (4)
- Sarah Johnson - Lead Groomer
- Mike Chen - Senior Groomer
- Emily Rodriguez - Groomer
- Alex Thompson - Bather

Each staff member has:
- Full contact information
- Specialties
- Hourly rates and commission rates
- Color coding for calendar
- Bookable services assignments

### Services (8)
- Full Groom ($85, 120 min)
- Bath & Brush ($45, 60 min)
- Nail Trim ($15, 15 min)
- De-shedding Treatment ($35, 45 min)
- Teeth Brushing ($20, 15 min)
- Show Cut ($150, 180 min)
- Puppy First Groom ($55, 90 min)
- Ear Cleaning ($12, 10 min)

### Customers & Pets (15 customers, 16 pets)
Includes diverse breeds:
- Poodles, German Shepherds, Golden Retrievers
- Beagles, Labradors, Yorkshire Terriers
- Bulldogs, Shih Tzus, French Bulldogs
- And more!

Each customer has:
- Full contact details
- Address information
- Pet profiles with breed, age, weight class, gender
- Special notes and preferences

### Appointments (~200-350)
- Distributed across 32 days (Oct 15 - Nov 15, 2025)
- 6-12 appointments per weekday
- 3-6 appointments on Saturdays
- Sundays closed
- Mixed statuses:
  - Past dates: mostly completed, some no-shows/cancelled
  - Future dates: scheduled, confirmed, checked-in
- Various services and staff assignments
- Customer notes and preferences

### POS Transactions (~64-160)
- 2-5 transactions per past date
- Mix of payment methods: cash, card, CashApp, Chime
- Multiple items per transaction
- Tax calculations (8%)
- Time-stamped throughout business hours

### Inventory (12 items)
Products include:
- Premium Dog Shampoo
- Hypoallergenic Conditioner
- Professional Grooming Scissors
- Nail Clippers (Large & Small)
- Dog Treats
- Ear Cleaning Solution
- De-shedding Tool
- Flea & Tick Shampoo
- Grooming Towels
- Dental Care Kit
- Whitening Shampoo

Each item has:
- Stock quantities
- Reorder levels
- Cost and selling prices
- Supplier information
- Storage locations

### Suppliers (4)
- Pet Pro Supplies (shampoos, conditioners)
- Groomer's Choice (tools, equipment)
- Healthy Paws Co. (treats, dental products)
- Salon Essentials (towels, accessories)

### Inventory Transactions (~48+)
- Restock transactions
- Usage transactions
- Proper quantity tracking
- Timestamped and attributed to staff

### Staff Schedules (~400+ shifts)
- Regular shifts Monday-Saturday
- Lunch breaks
- Individual days off:
  - Sarah: Wednesdays
  - Mike: Thursdays
  - Emily: Tuesdays
- Shorter hours on Saturdays
- Sundays closed

### Time-Off Requests (2)
- Approved vacation request
- Pending personal day request

## Views to Explore After Seeding

1. **Dashboard** - See metrics populated with real data
2. **Appointments** - Calendar filled with appointments across the date range
3. **Customers** - Browse 15 customers with their pets
4. **Staff** - View 4 staff members with full profiles
5. **Point of Sale** - See transaction history
6. **Inventory** - Check stock levels and transactions
7. **Reports** - Analyze groomer stats with actual data
8. **Finances** - Review financial metrics

## Technical Details

### File Location
- `/src/lib/comprehensive-seed-data.ts` - Main seeding script
- `/src/components/Settings.tsx` - Integration point

### Data Storage
Uses GitHub Spark's `useKV` key-value storage system:
- `staff-members` - Staff array
- `services` - Services array
- `customers` - Customers with pets array
- `appointments` - Appointments array
- `transactions` - POS transactions array
- `inventory-items` - Inventory items array
- `inventory-suppliers` - Suppliers array
- `inventory-transactions` - Inventory transaction history
- `staff-schedules` - Staff shifts array
- `time-off-requests` - Time-off requests array

### Date Range Logic
- Base date: October 15, 2025
- Range: 32 days (through November 15, 2025)
- Past appointments: Marked as completed/no-show/cancelled
- Future appointments: Scheduled/confirmed/checked-in
- Transactions: Only for past dates

## Notes

- The page will reload automatically after seeding to ensure all components reflect the new data
- You can re-run the seed at any time (it will replace existing data)
- All mock data follows the app's data structures and business rules
- Realistic names, phone numbers, and addresses are used
- Date calculations ensure proper chronological order
