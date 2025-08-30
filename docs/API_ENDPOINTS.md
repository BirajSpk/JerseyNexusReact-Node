# JerseyNexus API Endpoints Documentation

## Base URL
- **Development**: `http://localhost:5001/api`
- **Production**: `https://api.jerseynexus.com/api`

## Authentication
Most endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data
  "error": "Error message" // Only present if success is false
}
```

---

## 🔐 Authentication Endpoints

### POST /api/auth/register
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "phone": "+977-9800000000"
}
```

### POST /api/auth/login
Login user
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

### GET /api/auth/me
Get current user profile (Protected)

### PUT /api/auth/profile
Update user profile (Protected)
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "avatar": "https://example.com/avatar.jpg"
}
```

### PUT /api/auth/change-password
Change user password (Protected)
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

### POST /api/auth/logout
Logout user (Protected)

---

## 👥 User Management Endpoints

### GET /api/users
Get all users (Admin only)
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `role`: Filter by role (USER, ADMIN)

### GET /api/users/profile
Get current user profile (Protected)

### PUT /api/users/profile
Update current user profile (Protected)

### GET /api/users/stats
Get user statistics (Admin only)

### GET /api/users/:id
Get user by ID (Admin only)

### PUT /api/users/:id/role
Update user role (Admin only)
```json
{
  "role": "ADMIN" // or "USER"
}
```

### DELETE /api/users/:id
Delete user (Admin only)

---

## 🛍️ Product Endpoints

### GET /api/products
Get all products (Public)
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)
- `search`: Search term
- `category`: Category ID
- `categoryId`: Category ID
- `featured`: true/false
- `sortBy`: Field to sort by
- `sortOrder`: asc/desc
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `brand`: Brand name
- `size`: Size filter
- `color`: Color filter

### GET /api/products/:id
Get product by ID (Public)

### GET /api/products/slug/:slug
Get product by slug (Public)

### POST /api/products
Create new product (Admin only)
```json
{
  "name": "Manchester United Home Jersey 2024",
  "description": "Official Manchester United home jersey...",
  "price": 8500,
  "originalPrice": 10000,
  "categoryId": "category-uuid",
  "brand": "Adidas",
  "sizes": ["S", "M", "L", "XL"],
  "colors": ["Red", "White"],
  "images": ["image1.jpg", "image2.jpg"],
  "stock": 50,
  "featured": true,
  "tags": ["football", "jersey", "manchester-united"]
}
```

### PUT /api/products/:id
Update product (Admin only)

### DELETE /api/products/:id
Delete product (Admin only)

---

## 📂 Category Endpoints

### GET /api/categories
Get all categories (Public)
**Query Parameters:**
- `type`: PRODUCT or BLOG

### POST /api/categories
Create new category (Admin only)
```json
{
  "name": "Football Jerseys",
  "description": "Professional football team jerseys",
  "type": "PRODUCT",
  "image": "category-image.jpg"
}
```

### PUT /api/categories/:id
Update category (Admin only)

### DELETE /api/categories/:id
Delete category (Admin only)

---

## 🛒 Order Endpoints

### GET /api/orders
Get user orders (Protected)
**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: Order status filter

### GET /api/orders/:id
Get order by ID (Protected - own orders or Admin)

### POST /api/orders
Create new order (Protected)
```json
{
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "price": 8500,
      "size": "L",
      "color": "Red"
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+977-9800000000",
    "address": "Kathmandu, Nepal",
    "city": "Kathmandu",
    "postalCode": "44600"
  },
  "paymentMethod": "KHALTI", // or "COD"
  "totalAmount": 17000
}
```

### PUT /api/orders/:id
Update order status (Admin only)
```json
{
  "status": "PROCESSING" // PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
}
```

---

## 💳 Payment Endpoints

### POST /api/payments/khalti/initiate
Initiate Khalti payment (Protected)
```json
{
  "orderId": "order-uuid",
  "amount": 17000,
  "productName": "Order #12345"
}
```

### POST /api/payments/khalti/verify
Verify Khalti payment (Protected)
```json
{
  "token": "khalti-payment-token",
  "orderId": "order-uuid"
}
```

### GET /api/payments/khalti/callback
Khalti payment callback (Public)

### POST /api/payments/cod/process
Process Cash on Delivery order (Protected)
```json
{
  "orderId": "order-uuid"
}
```

---

## ⭐ Review Endpoints

### GET /api/reviews
Get all reviews (Public)
**Query Parameters:**
- `productId`: Filter by product
- `page`: Page number
- `limit`: Items per page

### POST /api/reviews
Create new review (Protected)
```json
{
  "productId": "product-uuid",
  "rating": 5,
  "comment": "Excellent product quality!"
}
```

### PUT /api/reviews/:id
Update review (Protected - own reviews only)

### DELETE /api/reviews/:id
Delete review (Protected - own reviews or Admin)

---

## 📝 Blog Endpoints

### GET /api/blogs
Get all blogs (Public)
**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `category`: Category filter
- `search`: Search term

### GET /api/blogs/:slug
Get blog by slug (Public)

### POST /api/blogs
Create new blog (Admin only)
```json
{
  "title": "Top 10 Football Jerseys of 2024",
  "content": "Blog content here...",
  "excerpt": "Short description...",
  "categoryId": "category-uuid",
  "featuredImage": "blog-image.jpg",
  "tags": ["football", "jerseys", "2024"],
  "published": true
}
```

### PUT /api/blogs/:id
Update blog (Admin only)

### DELETE /api/blogs/:id
Delete blog (Admin only)

---

## 📁 File Upload Endpoints

### POST /api/uploads/profile
Upload profile image (Protected)
- **Content-Type**: multipart/form-data
- **Field**: `image`
- **Max Size**: 5MB
- **Allowed Types**: JPEG, PNG, WebP

### POST /api/uploads/products
Upload product images (Admin only)
- **Content-Type**: multipart/form-data
- **Field**: `images` (multiple files)
- **Max Size**: 5MB per file
- **Allowed Types**: JPEG, PNG, WebP

### POST /api/uploads/editor
Upload editor media (Admin only)
- **Content-Type**: multipart/form-data
- **Field**: `file`

### DELETE /api/uploads/delete
Delete uploaded file (Protected)
```json
{
  "filepath": "/uploads/products/image.jpg"
}
```

---

## 🏥 Health Check Endpoints

### GET /health
API health check (Public)

### GET /health/database
Database health check (Public)

---

## 📊 Admin Dashboard Endpoints

### GET /api/users/stats
Get user statistics (Admin only)

### GET /api/products?featured=true
Get featured products

### GET /api/orders?status=PENDING
Get pending orders (Admin only)

---

## Error Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

## Rate Limiting
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Applies to**: All `/api/*` endpoints
