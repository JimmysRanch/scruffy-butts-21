# Mock Data Summary

## Data Counts by Category

### 👥 People
- **Staff Members**: 4
  - 1 Lead Groomer
  - 1 Senior Groomer
  - 1 Groomer
  - 1 Bather
- **Customers**: 15
- **Pets**: 16

### 📅 Scheduling
- **Appointments**: ~200-350
  - Calculated: 6-12 per weekday × ~24 weekdays + 3-6 per Saturday × ~4 Saturdays
  - Statuses: completed, scheduled, confirmed, checked-in, ready-for-pickup, cancelled, no-show
- **Staff Shifts**: ~400+
  - 4 staff × ~24 working days × 2 entries (shift + break)
- **Time-Off Requests**: 2

### 💰 Financial
- **POS Transactions**: ~64-160
  - 2-5 per day for past dates only (~16-20 past dates)
- **Services**: 8
  - Prices range from $12 to $150
  - Durations from 10 to 180 minutes

### 📦 Inventory
- **Inventory Items**: 12
  - 3 Shampoos
  - 1 Conditioner
  - 4 Tools
  - 2 Accessories
  - 1 Treats
  - 1 Other (ear cleaning)
- **Suppliers**: 4
- **Inventory Transactions**: ~48+
  - 1 restock + 2-5 usage per item

## Date Range
- **Start Date**: October 15, 2025
- **End Date**: November 15, 2025
- **Total Days**: 32 days
- **Business Days**: ~27 (excluding Sundays)

## Data Characteristics

### Staff
- All have complete profiles
- Realistic ratings (4.5 - 5.0)
- Different specialties and service assignments
- Color-coded for calendar
- Commission and hourly pay configured

### Customers
- Diverse names and locations
- Complete contact information
- 1-2 pets per customer
- Various dog breeds and sizes
- Special notes and preferences

### Appointments
- Realistic time distribution
- Past appointments mostly completed (85%)
- Future appointments pending/confirmed
- Random but realistic service selections
- Staff assigned based on service specialties
- Proper duration calculations

### Transactions
- Only for past dates (realistic)
- Multiple payment methods
- 1-3 items per transaction
- 8% tax applied
- Timestamped throughout business hours

### Inventory
- Current stock levels: 6-45 units
- Reorder points: 2-15 units
- Cost margins: ~50-100% markup
- Organized by category
- Tracked usage history

## Key Features

✅ **Chronologically Correct**: Past vs future dates handled properly
✅ **Relationally Sound**: All foreign keys properly linked
✅ **Realistically Distributed**: Not uniform, but natural patterns
✅ **Complete Profiles**: No missing required fields
✅ **Business Rule Compliant**: Follows app's validation rules
✅ **Test-Ready**: Covers edge cases and normal scenarios

## Storage Keys Used

```
staff-members           → Array<StaffMember>
services               → Array<Service>
customers              → Array<Customer>
appointments           → Array<Appointment>
transactions           → Array<Transaction>
inventory-items        → Array<InventoryItem>
inventory-suppliers    → Array<Supplier>
inventory-transactions → Array<InventoryTransaction>
staff-schedules        → Array<Shift>
time-off-requests      → Array<TimeOffRequest>
```

## Expected File Size

Approximate data size:
- **Staff**: ~2 KB
- **Services**: ~1 KB
- **Customers**: ~8 KB
- **Appointments**: ~80-150 KB
- **Transactions**: ~20-50 KB
- **Inventory**: ~5 KB
- **Schedules**: ~40 KB
- **Total**: ~150-250 KB

All stored in browser's IndexedDB via Spark KV system.

## Performance Notes

- Seeding takes ~1-2 seconds
- Page reload ensures clean state
- All data generated client-side
- No external API calls required
- Deterministic output (same data each time)
