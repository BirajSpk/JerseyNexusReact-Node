# JerseyNexus API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": [
    // Validation errors if any
  ]
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    "token": "jwt_token"
  }
}
```

#### POST /auth/login
Login user.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### GET /auth/me
Get current user profile (Protected).

#### PUT /auth/profile
Update user profile (Protected).

#### PUT /auth/change-password
Change user password (Protected).

### Products

#### GET /products
Get all products with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `search` (string): Search term
- `category` (string): Category slug
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "id": "product_id",
        "name": "Manchester United Home Jersey 2024",
        "description": "Official jersey...",
        "price": 4500,
        "stock": 50,
        "slug": "manchester-united-home-jersey-2024",
        "images": [
          {
            "url": "/uploads/jersey.jpg",
            "altText": "Jersey image",
            "isPrimary": true
          }
        ],
        "category": {
          "name": "Football Jerseys",
          "slug": "football-jerseys"
        },
        "averageRating": 4.5,
        "reviewCount": 10
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /products/:slug
Get single product by slug.

#### POST /products
Create product (Admin only).

#### PUT /products/:id
Update product (Admin only).

#### DELETE /products/:id
Delete product (Admin only).

### Categories

#### GET /categories
Get all categories.

**Query Parameters:**
- `type` (string): Category type (PRODUCT/BLOG, default: PRODUCT)

#### POST /categories
Create category (Admin only).

#### PUT /categories/:id
Update category (Admin only).

#### DELETE /categories/:id
Delete category (Admin only).

### Orders

#### GET /orders
Get user orders (Protected).

**For Admin:** Add `?userId=user_id` to get specific user orders.

#### POST /orders
Create new order (Protected).

**Request:**
```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "price": 4500
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "phone": "+977 9811543215",
    "address": "Kathmandu",
    "city": "Kathmandu",
    "postalCode": "44600"
  }
}
```

#### PUT /orders/:id
Update order status (Admin only).

### Reviews

#### GET /reviews/product/:productId
Get product reviews.

#### POST /reviews
Create review (Protected).

**Request:**
```json
{
  "productId": "product_id",
  "rating": 5,
  "comment": "Great jersey!"
}
```

#### DELETE /reviews/:id
Delete review (Protected - own reviews or Admin).

### Blogs

#### GET /blogs
Get all published blogs.

#### GET /blogs/:slug
Get single blog by slug.

#### POST /blogs
Create blog (Admin only).

#### PUT /blogs/:id
Update blog (Admin only).

#### DELETE /blogs/:id
Delete blog (Admin only).

### Users (Admin Only)

#### GET /users
Get all users with pagination.

#### GET /users/:id
Get user by ID.

#### PUT /users/:id/role
Update user role.

#### DELETE /users/:id
Delete user.

#### GET /users/stats
Get user statistics.

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.

## File Uploads

Image uploads support:
- Max file size: 5MB
- Formats: JPG, PNG, WEBP
- Alt text required for accessibility