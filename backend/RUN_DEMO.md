# How to Run the Interest Calculation Demo

## Option 1: Run via IDE

1. Open the project in your IDE (IntelliJ IDEA, Eclipse, etc.)
2. Navigate to `backend/src/main/java/com/pledge/backend/InterestCalculationDemo.java`
3. Right-click and select "Run" or "Run InterestCalculationDemo"

## Option 2: Run via Command Line

### Prerequisites
- Java JDK installed
- Maven installed

### Steps

1. Navigate to the backend directory:
```bash
cd backend
```

2. Compile the Java files:
```bash
mvn compile
```

3. Run the demo:
```bash
java -cp "target/classes" com.pledge.backend.InterestCalculationDemo
```

## Expected Output

```
=== Pledge Master - Monthly Interest Calculation Demo ===

Demo 1: ₹1,00,000 loan:
  Amount: ₹100,000.00
  Interest Rate: 2.0%
  Monthly Interest: ₹2,000.00

--- Partial Payment Demo ---
Original Loan: ₹100,000.00
Original Amount: ₹100,000.00 (Rate: 2.0%, Monthly Interest: ₹2,000.00)
Payment: ₹40,000.00
Remaining Amount: ₹60,000.00 (Rate: 2.5%, Monthly Interest: ₹1,500.00)

--- Various Amount Scenarios ---
₹30,000 (3% slab):
  Amount: ₹30,000.00
  Interest Rate: 3.0%
  Monthly Interest: ₹900.00

₹75,000 (2.5% slab):
  Amount: ₹75,000.00
  Interest Rate: 2.5%
  Monthly Interest: ₹1,875.00

₹1,50,000 (2% slab):
  Amount: ₹150,000.00
  Interest Rate: 2.0%
  Monthly Interest: ₹3,000.00

--- Multiple Partial Payments Demo ---
Starting Amount: ₹100,000.00

Payment 1: ₹30,000.00
Remaining: ₹70,000.00
New Monthly Interest: ₹1,750.00 (2.5%)

Payment 2: ₹25,000.00
Remaining: ₹45,000.00
New Monthly Interest: ₹1,350.00 (3.0%)
```

## Test via REST API

Once the backend is running, you can test the API endpoints:

### 1. Calculate Monthly Interest
```bash
curl "http://localhost:8099/api/interest/calculate?amount=100000"
```

### 2. Handle Partial Payment
```bash
curl -X POST "http://localhost:8099/api/interest/partial-payment" \
  -H "Content-Type: application/json" \
  -d '{"originalAmount": 100000, "paymentAmount": 40000}'
```

### 3. Get Interest Rate
```bash
curl "http://localhost:8099/api/interest/rate?amount=100000"
```

## Troubleshooting

### Issue: "Class not found"
**Solution:** Make sure you've compiled the project with `mvn compile`

### Issue: "Cannot access InterestCalculationService"
**Solution:** Make sure the service is in the correct package and compiled

### Issue: Demo doesn't run
**Solution:** Try running from the root directory:
```bash
cd backend
mvn clean compile
java -cp "target/classes:target/dependency/*" com.pledge.backend.InterestCalculationDemo
```

