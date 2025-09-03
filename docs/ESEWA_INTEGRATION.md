# eSewa Payment Integration Guide

## Overview

This document provides a comprehensive guide for the eSewa payment integration in JerseyNexus. The implementation follows eSewa's ePay v2 API specifications and includes proper signature generation, payment processing, and status verification.

## Features Implemented

✅ **eSewa ePay v2 Integration**
- Form-based payment initiation
- HMAC-SHA256 signature generation
- Base64 encoded response handling
- Payment status verification

✅ **Payment Flow Support**
- Pre-order payment (create order first, then pay)
- Post-order payment (pay first, create order after success)
- Cash on Delivery (COD) alternative

✅ **Security Features**
- Signature verification for all transactions
- Secure callback handling
- Transaction UUID validation
- Amount verification

✅ **Status Management**
- Real-time payment status checking
- WebSocket notifications
- Order status synchronization
- Stock management integration

## API Endpoints

### Payment Initiation
```
POST /api/payments/esewa/initiate
POST /api/payments/esewa/initiate-with-order
```

### Payment Verification
```
POST /api/payments/esewa/verify
GET /api/payments/esewa/status/:transaction_uuid
```

### Callbacks
```
GET /api/payments/esewa/success (Public)
```

## Environment Variables

```env
# eSewa Configuration
ESEWA_MERCHANT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_SUCCESS_URL=http://localhost:5003/api/payments/esewa/success
ESEWA_FAILURE_URL=http://localhost:3000/payment/failed
ESEWA_FORM_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
ESEWA_STATUS_CHECK_URL=https://rc.esewa.com.np/api/epay/transaction/status/
BACKEND_URL=http://localhost:5003
FRONTEND_URL=http://localhost:3000
```

## Testing Credentials

For UAT/Testing environment:

- **eSewa ID**: 9806800001, 9806800002, 9806800003, 9806800004, 9806800005
- **Password**: Nepal@123
- **MPIN**: 1122 (for mobile app)
- **Token**: 123456 (fixed for testing)

## Payment Flow

### 1. Payment Initiation

```javascript
// Frontend - Initiate payment
const response = await paymentAPI.initiateEsewaWithOrderData({
  orderData: {
    items: [...],
    totalAmount: 1000,
    shippingAddress: {...}
  },
  amount: 1000,
  productName: 'JerseyNexus Order'
});

// Response contains form parameters
const { payment_url, esewaParams } = response.data.data;
```

### 2. Form Submission

```javascript
// Auto-submit form to eSewa
const form = document.createElement('form');
form.method = 'POST';
form.action = payment_url;

Object.entries(esewaParams).forEach(([key, value]) => {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = key;
  input.value = value;
  form.appendChild(input);
});

document.body.appendChild(form);
form.submit();
```

### 3. Payment Processing

User completes payment on eSewa platform using test credentials.

### 4. Success Callback

eSewa redirects to success URL with base64 encoded response:

```
GET /api/payments/esewa/success?data=eyJ0cmFuc2FjdGlvbl9jb2RlIjoi...
```

### 5. Response Verification

Backend decodes and verifies the response:

```javascript
const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
const { transaction_code, status, signature } = decodedData;

// Verify signature
const expectedSignature = crypto
  .createHmac('sha256', ESEWA_SECRET_KEY)
  .update(signatureMessage)
  .digest('base64');
```

## Signature Generation

### Request Signature
```javascript
const signatureMessage = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
const signature = crypto
  .createHmac('sha256', ESEWA_SECRET_KEY)
  .update(signatureMessage)
  .digest('base64');
```

### Response Signature Verification
```javascript
const signatureMessage = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code},signed_field_names=${signed_field_names}`;
const expectedSignature = crypto
  .createHmac('sha256', ESEWA_SECRET_KEY)
  .update(signatureMessage)
  .digest('base64');
```

## Status Check API

Check payment status using eSewa's status API:

```javascript
const statusResponse = await axios.get('https://rc.esewa.com.np/api/epay/transaction/status/', {
  params: {
    product_code: 'EPAYTEST',
    total_amount: 1000,
    transaction_uuid: 'payment-id-123'
  }
});

// Response statuses:
// COMPLETE, PENDING, CANCELED, NOT_FOUND, AMBIGUOUS, FULL_REFUND, PARTIAL_REFUND
```

## Frontend Integration

### Using EsewaPayment Component

```jsx
import EsewaPayment from '../components/EsewaPayment';

<EsewaPayment
  orderData={orderData}
  onSuccess={(data) => {
    console.log('Payment successful:', data);
    navigate('/order-success');
  }}
  onError={(error) => {
    console.error('Payment failed:', error);
    navigate('/payment/failed');
  }}
/>
```

### Manual Integration

```jsx
// In checkout component
if (paymentMethod === 'esewa') {
  const esewaResponse = await paymentAPI.initiateEsewaWithOrderData({
    orderData,
    amount: finalTotal,
    productName: 'JerseyNexus Order'
  });
  
  if (esewaResponse.data.success) {
    const { payment_url, esewaParams } = esewaResponse.data.data;
    
    // Create and submit form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payment_url;
    
    Object.entries(esewaParams).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
  }
}
```

## Testing

Run the integration test suite:

```bash
cd backend
node scripts/testEsewaIntegration.js
```

This will test:
- Signature generation
- Form parameter validation
- Status check API connectivity
- Backend endpoint availability
- Environment variable configuration

## Production Deployment

For production deployment:

1. **Update Environment Variables**:
   ```env
   ESEWA_FORM_URL=https://epay.esewa.com.np/api/epay/main/v2/form
   ESEWA_STATUS_CHECK_URL=https://epay.esewa.com.np/api/epay/transaction/status/
   ESEWA_MERCHANT_CODE=YOUR_PRODUCTION_CODE
   ESEWA_SECRET_KEY=YOUR_PRODUCTION_SECRET
   ```

2. **Update URLs**:
   - Set production backend and frontend URLs
   - Configure proper success/failure redirect URLs

3. **SSL Certificate**:
   - Ensure HTTPS is enabled for production
   - eSewa requires secure callbacks

## Troubleshooting

### Common Issues

1. **Signature Mismatch**:
   - Verify secret key is correct
   - Check message format exactly matches documentation
   - Ensure no extra spaces or characters

2. **Payment Not Found**:
   - Check transaction UUID is being passed correctly
   - Verify payment record exists in database

3. **Callback Not Received**:
   - Check success URL is accessible
   - Verify no firewall blocking eSewa servers
   - Check backend logs for errors

### Debug Mode

Enable debug logging in development:

```javascript
console.log('📝 eSewa signature generation:');
console.log('Message:', signatureMessage);
console.log('Key:', hmacKey);
console.log('Signature:', signature);
```

## Support

For eSewa integration support:
- eSewa Developer Portal: https://developer.esewa.com.np/
- eSewa Support: support@esewa.com.np
- Documentation: https://developer.esewa.com.np/pages/Epay

For JerseyNexus specific issues:
- Check backend logs for detailed error messages
- Use the test suite to verify configuration
- Monitor WebSocket events for real-time updates
