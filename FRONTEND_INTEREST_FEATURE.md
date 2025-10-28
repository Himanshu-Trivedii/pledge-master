# Frontend Interest Calculation Feature

## Overview
The frontend now includes comprehensive interest calculation features with monthly interest display and partial payment support.

## Features Implemented

### 1. Enhanced Pledge Creation Form (`NewPledgeSimple.tsx`)

#### Monthly Interest Display
When creating a pledge, users now see:
- **Interest Rate**: Automatically calculated based on loan amount (3%, 2.5%, or 2%)
- **Monthly Interest**: Real-time calculation showing the monthly interest amount
- **Slab Information**: Shows which interest slab applies to the amount

**Example Display:**
```
Interest Details
├─ Rate: 2.0%
├─ Monthly Interest: ₹2,000.00
└─ Slab: Above ₹1,00,000
```

#### Features:
- Real-time calculation as user types the amount
- Visual indication of interest slab
- Clear formatting of currency values
- Automatic calculation without backend calls (for speed)

### 2. Payment Recording Modal (`PaymentModal.tsx`)

A new modal component for recording partial payments with preview:

#### Features:
- **Current Amount Display**: Shows the current pledge amount
- **Payment Input**: Number input for payment amount
- **Live Preview**: Shows what will happen after payment:
  - Remaining amount
  - New interest rate (if slab changes)
  - New monthly interest
- **Validation**: Prevents overpayment
- **Success Handling**: Refreshes pledge data after successful payment

#### Example Preview:
```
After Payment:
├─ Remaining Amount: ₹60,000.00
├─ New Interest Rate: 2.5%
└─ New Monthly Interest: ₹1,500.00
```

### 3. Enhanced Pledge Detail Page (`PledgeDetail.tsx`)

- **Record Payment Button**: Opens the payment modal
- **Refresh on Payment**: Automatically updates after payment is recorded
- **Clean UI**: Professional payment recording interface

### 4. API Integration (`api.ts`)

New API methods added:

```typescript
export const interestApi = {
    calculateInterest: (amount) => apiClient.get(`/interest/calculate?amount=${amount}`),
    handlePartialPayment: (originalAmount, paymentAmount) => 
        apiClient.post('/interest/partial-payment', { originalAmount, paymentAmount }),
    getInterestRate: (amount) => apiClient.get(`/interest/rate?amount=${amount}`),
};
```

## User Flow

### Creating a Pledge with Interest Calculation

1. Navigate to "New Pledge" page
2. Select customer
3. Enter item details (type, weight, purity)
4. Enter loan amount
5. **Automatically see**:
   - Interest rate
   - Monthly interest amount
   - Applicable slab
6. Complete the form and submit

### Recording a Partial Payment

1. Navigate to a pledge detail page
2. Click "Record Payment" button
3. Enter payment amount
4. **See live preview** of:
   - Remaining amount
   - New interest rate
   - New monthly interest
5. Confirm payment
6. Pledge automatically updates with new values

## Visual Examples

### Interest Rate Display in Pledge Creation

```
┌─────────────────────────────────────┐
│ Interest Details                     │
├─────────────────────────────────────┤
│ Rate:                         2.0%  │
├─────────────────────────────────────┤
│ Monthly Interest:          ₹2,000  │
├─────────────────────────────────────┤
│ Slab: Above ₹1,00,000              │
└─────────────────────────────────────┘
```

### Payment Modal Preview

```
┌─────────────────────────────────────┐
│ Record Payment                       │
├─────────────────────────────────────┤
│ Current Amount:         ₹1,00,000  │
│                                         │
│ Payment Amount: [ 40,000 ]          │
│                                         │
│ ╔═══════════════════════════════════╗ │
│ ║ After Payment:                    ║ │
│ ║ Remaining Amount:      ₹60,000  ║ │
│ ║ New Interest Rate:        2.5%  ║ │
│ ║ New Monthly Interest:  ₹1,500  ║ │
│ ╚═══════════════════════════════════╝ │
│                                         │
│ [Cancel]  [Record Payment]             │
└─────────────────────────────────────┘
```

## Technical Details

### Components

1. **NewPledgeSimple.tsx**
   - Added `monthlyInterest` state
   - Calculates monthly interest: `(amount * rate) / 100`
   - Displays in formatted card with Indian currency format

2. **PaymentModal.tsx** (New Component)
   - Dialog-based modal
   - Real-time preview using `interestApi.handlePartialPayment()`
   - Auto-refresh on success
   - Toast notifications for errors

3. **PledgeDetail.tsx**
   - Integrated PaymentModal
   - Replaced inline form with modal
   - Auto-refresh pledge data after payment

4. **api.ts**
   - Added `interestApi` exports
   - Three methods for interest calculations
   - Consistent error handling

## Benefits

1. **User-Friendly**: Clear visual feedback on interest rates
2. **Real-Time**: Instant calculations as user types
3. **Transparent**: Shows exactly what will happen after payment
4. **Error Prevention**: Validation prevents invalid payments
5. **Professional UI**: Clean, modern interface with proper formatting

## Integration with Backend

The frontend integrates seamlessly with the backend API:
- Uses REST endpoints for partial payment calculations
- Calls `POST /api/pledges/{id}/payment` to record payments
- Handles responses and updates UI accordingly

## Demo Scenarios

### Scenario 1: ₹1,00,000 Loan
- **Input**: ₹1,00,000
- **Display**: Rate 2%, Monthly Interest ₹2,000

### Scenario 2: Partial Payment
- **Before**: ₹1,00,000 at 2% = ₹2,000/month
- **Payment**: ₹40,000
- **After**: ₹60,000 at 2.5% = ₹1,500/month

### Scenario 3: Multiple Slabs
- **₹30,000**: Rate 3%, Monthly Interest ₹900
- **₹75,000**: Rate 2.5%, Monthly Interest ₹1,875
- **₹1,50,000**: Rate 2%, Monthly Interest ₹3,000

## Future Enhancements

- [ ] Payment history visualization
- [ ] Interest accrual simulation
- [ ] Email notifications for interest changes
- [ ] PDF export of interest calculations
- [ ] Dashboard with total interest calculations

