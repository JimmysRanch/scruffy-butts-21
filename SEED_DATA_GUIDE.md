# Seed Data Guide

## Overview

The Scruffy Butts application includes a seed data feature that populates the database with realistic demo data for testing and demonstration purposes.

## What Gets Seeded

When you click the "Seed Reports Data" button in Settings → Security, the system will populate:

- **4 Staff Members** - Sarah Johnson, Mike Chen, Emily Rodriguez, Alex Thompson
- **6 Customers** - Complete profiles with contact information and addresses
- **8 Pets** - Various breeds and sizes (Golden Retriever, Poodle, Yorkshire Terrier, Beagle, German Shepherd, Shih Tzu, Australian Shepherd, Labrador Retriever)
- **18 Appointments** - 10 completed (last 30 days) and 8 upcoming (next 7 days)
- **10 Transactions** - Generated for all completed appointments with tax, tips, and various payment methods

## ⚠️ Important Requirements

### GitHub Spark Environment Required

This application uses **GitHub Spark's KV (Key-Value) storage** for data persistence. For the seed data feature to work properly, you **must** run the application in a properly authenticated GitHub Spark environment.

#### Recommended Environment: GitHub Codespaces

The best way to run this application is in **GitHub Codespaces**:

1. Open the repository in GitHub
2. Click the green "Code" button
3. Select the "Codespaces" tab
4. Click "Create codespace on main" (or your branch)
5. Wait for the Codespace to initialize
6. Run `npm install` and `npm run dev`
7. The Spark backend will be automatically authenticated

### What Happens Without Spark Authentication

If you run this application locally with `npm run dev` without proper Spark backend configuration, you will experience:

- ❌ "401 Unauthorized" errors in the browser console
- ❌ Seed data appears to save but doesn't persist between page reloads
- ❌ Data doesn't appear when navigating to Clients, Staff, or Appointments pages
- ❌ The success toast message appears, but the data isn't actually stored

This is **expected behavior** - the application requires Spark's backend infrastructure to function properly.

## How to Use Seed Data

1. **Navigate to Settings**
   - Click the "Settings" button in the main navigation

2. **Go to Security Tab**
   - Click "Security" in the left sidebar of Settings

3. **Click "Seed Reports Data"**
   - Find the "Reports Data" section
   - Click the "Seed Reports Data" button

4. **Verify Success**
   - You should see a detailed success message showing:
     - 4 staff members
     - 6 customers with 8 pets
     - 18 appointments
     - 10 transactions

5. **View the Data**
   - Navigate to **Clients** to see the seeded customers and pets
   - Navigate to **Staff** to see the seeded staff members
   - Navigate to **Appointments** to see the seeded appointments
   - Navigate to **Reports** to see analytics based on the seeded transactions

## Data Details

### Customers
1. Jennifer Thompson - 2 pets (Max, Luna)
2. Robert Martinez - 1 pet (Bella)
3. Lisa Anderson - 2 pets (Charlie, Daisy)
4. Michael Chen - 1 pet (Rocky)
5. Sarah Williams - 1 pet (Princess)
6. David Brown - 1 pet (Cooper)

### Staff Members
1. Sarah Johnson - Lead Groomer
2. Mike Chen - Senior Groomer
3. Emily Rodriguez - Groomer
4. Alex Thompson - Bather

### Appointment Distribution
- **Past Appointments**: Spread across the last 30 days
- **Upcoming Appointments**: Scheduled for the next 7 days including today
- **Services**: Full Groom, Bath & Brush, Nail Trim, De-shedding Treatment, Show Cut, Teeth Brushing
- **Statuses**: completed, scheduled, confirmed, checked-in

### Transactions
- Generated for all 10 completed appointments
- Include Texas sales tax (8.25%)
- Variable tips ($0-$20)
- Multiple payment methods (cash, card, CashApp, Chime)

## Troubleshooting

### Issue: Data doesn't appear after seeding

**Cause**: Running outside of a Spark-authenticated environment

**Solution**: 
1. Use GitHub Codespaces (recommended)
2. Or ensure your local environment has proper Spark authentication configured
3. Check browser console for "401 Unauthorized" errors - these indicate authentication issues

### Issue: Success message appears but pages show "No clients yet"

**Cause**: Same as above - KV storage isn't persisting without proper authentication

**Solution**: Switch to GitHub Codespaces or properly configure Spark authentication

### Issue: Want to clear seeded data

**Solution**: The data persists in Spark's KV storage. To clear:
1. Manually delete customers, staff, and appointments through the UI
2. Or clear the Spark KV storage (method depends on your Spark configuration)

## Technical Details

### Storage Keys Used
- `staff-members` - Staff/groomer data
- `customers` - Customer and pet data
- `appointments` - Appointment scheduling data
- `transactions` - Payment and transaction records
- `services` - Service offerings and pricing

### Data Transformation
The seed function automatically transforms raw seed data to match the application's data models:
- Staff data is converted to `StaffMember` interface with compensation settings
- Services are migrated to include pricing method configurations
- All data includes proper timestamps and relationships

## Further Help

If you continue to experience issues with seed data:
1. Verify you're running in GitHub Codespaces
2. Check the browser console for authentication errors
3. Review the Spark documentation for KV storage setup
4. Contact the development team for assistance

---

**Note**: This seed data is for demonstration and testing purposes only. In a production environment, you would replace this with real customer data.
