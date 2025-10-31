# Monthly Interest Calculation Feature

## Overview
This feature implements automatic monthly interest calculation based on loan amount slabs. Interest rates are calculated dynamically and can be recalculated when partial payments are made.

## Interest Rate Slabs

| Amount Range | Interest Rate | Monthly Interest (Example) |
|-------------|---------------|---------------------------|
| ₹0 - ₹49,999 | 3% | ₹30,000 → ₹900/month |
| ₹50,000 - ₹99,999 | 2.5% | ₹75,000 → ₹1,875/month |
| ₹1,00,000+ | 2% | ₹1,00,000 → ₹2,000/month |

## Features

### 1. Calculate Monthly Interest
Returns the monthly interest amount for a given loan amount.

**Example:** ₹1,00,000 → ₹2,000/month (2%)

### 2. Partial Payment Support
When a partial payment is made, the system automatically:
- Reduces the remaining amount
- Recalculates the interest rate based on the new amount slab
- Updates the monthly interest

**Example Demo:**
```
Original Amount: ₹1,00,000
Interest Rate: 2%
Monthly Interest: ₹2,000

Payment: ₹40,000

Remaining Amount: ₹60,000
New Interest Rate: 2.5%
New Monthly Interest: ₹1,500
```

## Usage

### Running the Demo

To see the demo calculations:

```bash
cd backend
javac -cp "target/classes:target/dependency/*" src/main/java/com/pledge/backend/InterestCalculationDemo.java
java -cp "target/classes:target/dependency/*" com.pledge.backend.InterestCalculationDemo
```

### REST API Endpoints

#### 1. Calculate Monthly Interest
```http
GET /api/interest/calculate?amount=100000
```

**Response:**
```json
{
  "success": true,
  "message": "Interest calculated successfully",
  "data": {
    "amount": 100000,
    "interestRate": 2.0,
    "monthlyInterest": 2000.0
  }
}
```

#### 2. Handle Partial Payment
```http
POST /api/interest/partial-payment
Content-Type: application/json

{
  "originalAmount": 100000,
  "paymentAmount": 40000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Partial payment processed successfully",
  "data": {
    "originalAmount": 100000.0,
    "paymentAmount": 40000.0,
    "remainingAmount": 60000.0,
    "originalMonthlyInterest": 2000.0,
    "newMonthlyInterest": 1500.0,
    "originalInterestRate": 2.0,
    "newInterestRate": 2.5
  }
}
```

#### 3. Get Interest Rate
```http
GET /api/interest/rate?amount=100000
```

**Response:**
```json
{
  "success": true,
  "message": "Interest rate retrieved successfully",
  "data": {
    "amount": 100000,
    "interestRate": 2.0,
    "slab": "1,00,000+ (2%)"
  }
}
```

### Using in Pledge Creation

The interest rate is automatically calculated when creating a pledge:

```http
POST /api/pledges
Content-Type: application/json

{
  "customerId": 1,
  "title": "Gold Chain Pledge",
  "description": "22K gold chain",
  "itemType": "Gold Chain",
  "weight": 50.0,
  "purity": "22K",
  "amount": 100000,
  "status": "ACTIVE",
  "pledgeDuration": 12,
  "deadline": "2025-12-31T23:59:59"
}
```

The interest rate (2%) will be automatically calculated and stored.

### Recording Partial Payments

To record a partial payment and update the interest:

```http
POST /api/pledges/{pledgeId}/payment
Content-Type: application/json

{
  "amount": 40000
}
```

This will:
1. Reduce the pledge amount
2. Recalculate the interest rate based on the new amount
3. Update the monthly interest

## Demo Examples

### Demo 1: Basic Calculation
```
Amount: ₹1,00,000
Interest Rate: 2%
Monthly Interest: ₹2,000
```

### Demo 2: Partial Payment
```
Original Amount: ₹1,00,000 (Rate: 2%, Monthly Interest: ₹2,000)
Payment: ₹40,000
Remaining Amount: ₹60,000 (Rate: 2.5%, Monthly Interest: ₹1,500)
```

### Demo 3: Various Amounts
```
₹30,000 → Rate: 3%, Monthly Interest: ₹900
₹75,000 → Rate: 2.5%, Monthly Interest: ₹1,875
₹1,50,000 → Rate: 2%, Monthly Interest: ₹3,000
```

### Demo 4: Multiple Partial Payments
```
Starting Amount: ₹1,00,000

Payment 1: ₹30,000
Remaining: ₹70,000 (Rate: 2.5%, Monthly Interest: ₹1,750)

Payment 2: ₹25,000
Remaining: ₹45,000 (Rate: 3%, Monthly Interest: ₹1,350)
```

## Implementation Details

### Service Class
- `InterestCalculationService` - Handles all interest calculations
- Methods:
  - `calculateMonthlyInterest()` - Calculate monthly interest from amount
  - `getInterestRate()` - Get interest rate for an amount
  - `handlePartialPayment()` - Process partial payment and recalculate

### Integration
- `PledgeServiceImpl` - Uses InterestCalculationService for automatic rate calculation
- `InterestController` - REST endpoints for interest calculations
- `InterestCalculationDemo` - Standalone demo with main() method

## Benefits

1. **Automatic Calculation** - No manual entry required
2. **Dynamic Slabs** - Interest rate adjusts based on amount
3. **Partial Payment Support** - Easy to recalculate after payments
4. **Transparent** - Clear calculation logic
5. **REST API** - Easy integration with frontend

## Testing

Use Postman or curl to test the endpoints:

```bash
# Calculate interest
curl "http://localhost:8099/api/interest/calculate?amount=100000"

# Partial payment
curl -X POST "http://localhost:8099/api/interest/partial-payment" \
  -H "Content-Type: application/json" \
  -d '{"originalAmount": 100000, "paymentAmount": 40000}'

# Get rate
curl "http://localhost:8099/api/interest/rate?amount=100000"
```

