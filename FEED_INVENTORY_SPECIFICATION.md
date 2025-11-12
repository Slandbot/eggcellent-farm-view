# Feed Inventory Endpoints Specification

This document outlines the implementation details for all feed inventory endpoints and data requirements.

## Base Configuration

- **Base URL**: `http://localhost:3000/api` (configurable via `VITE_API_BASE_URL` environment variable)
- **Content-Type**: `application/json`
- **Authorization Header**: `Bearer <token>` (for protected endpoints)

---

## Endpoints

### 1. GET `/api/feed` - Get Feed Inventory List

**Purpose**: Retrieve all feed items with optional filtering

**Query Parameters**:
- `type` (optional): Filter by feed type (layer, starter, grower, finisher, supplement)
- `status` (optional): Filter by status (In Stock, Low Stock, Out of Stock)
- `search` (optional): Search by name or supplier (case-insensitive)
- `supplier` (optional): Filter by supplier name

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "category": "string",
      "stock": "number",
      "maxCapacity": "number",
      "unit": "string",
      "status": "string",
      "expiryDate": "string (ISO date)",
      "supplier": "string",
      "cost": "number",
      "costPerUnit": "number",
      "location": "string",
      "batchNumber": "string (optional)",
      "notes": "string (optional)",
      "createdAt": "string (ISO date)",
      "updatedAt": "string (ISO date)"
    }
  ]
}
```

---

### 2. GET `/api/feed/stats` - Get Feed Statistics

**Purpose**: Get aggregated statistics for dashboard cards

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "totalItems": "number",
    "lowStockItems": "number",
    "outOfStockItems": "number",
    "totalValue": "number (optional)",
    "totalStock": "number (optional)",
    "dailyConsumption": "number (optional)",
    "stockChange": "string (optional)",
    "lowStockPercentage": "string (optional)",
    "daysRemaining": "number (optional)",
    "stockTrend": "up" | "down" | "stable" (optional)"
  }
}
```

---

### 3. POST `/api/feed` - Add New Feed Item

**Purpose**: Create a new feed inventory item

**Request Body**:
```json
{
  "name": "string (required)",
  "type": "string (required)",
  "supplier": "string (required)",
  "quantity": "number (required)",
  "unit": "string (required, e.g., 'kg', 'lbs', 'tons')",
  "costPerUnit": "number (optional)",
  "expiryDate": "string (optional, ISO date)",
  "location": "string (optional, storage location)",
  "maxCapacity": "number (optional)",
  "batchNumber": "string (optional)",
  "notes": "string (optional)"
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "message": "Feed item created successfully",
  "data": {
    "id": "string",
    "name": "string",
    "type": "string",
    "category": "string",
    "stock": "number",
    "maxCapacity": "number",
    "unit": "string",
    "status": "string",
    "expiryDate": "string",
    "supplier": "string",
    "cost": "number",
    "costPerUnit": "number",
    "location": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### 4. PUT `/api/feed/:id` - Update Feed Item

**Purpose**: Update an existing feed item (for Edit functionality)

**Request Body** (all fields optional):
```json
{
  "name": "string",
  "type": "string",
  "supplier": "string",
  "stock": "number",
  "maxCapacity": "number",
  "unit": "string",
  "costPerUnit": "number",
  "expiryDate": "string (ISO date)",
  "location": "string",
  "status": "string",
  "notes": "string"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Feed item updated successfully",
  "data": {
    "id": "string",
    "name": "string",
    // ... updated feed item object
  }
}
```

---

### 5. DELETE `/api/feed/:id` - Delete Feed Item

**Purpose**: Remove a feed item from inventory

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Feed item deleted successfully",
  "data": {
    "id": "string"
  }
}
```

---

### 6. POST `/api/feed/usage` - Record Feed Usage

**Purpose**: Record when feed is consumed/used

**Request Body**:
```json
{
  "feedId": "string (required)",
  "quantity": "number (required)",
  "pen": "string (required)",
  "usedBy": "string (required, user ID)",
  "date": "string (required, ISO date)",
  "notes": "string (optional)"
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "message": "Feed usage recorded successfully",
  "data": {
    "id": "string",
    "feedId": "string",
    "quantity": "number",
    "pen": "string",
    "usedBy": "string",
    "date": "string",
    "notes": "string",
    "createdAt": "string"
  }
}
```

---

### 7. GET `/api/feed/usage` - Get Feed Usage History

**Purpose**: Retrieve feed usage records

**Query Parameters**:
- `feedId` (optional): Filter by specific feed item
- `dateFrom` (optional): Start date filter (ISO date)
- `dateTo` (optional): End date filter (ISO date)

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "feedId": "string",
      "feedName": "string",
      "quantity": "number",
      "pen": "string",
      "usedBy": "string",
      "userName": "string",
      "date": "string",
      "notes": "string",
      "createdAt": "string"
    }
  ]
}
```

---

### 8. POST `/api/feed/:id/reorder` - Create Reorder Request (Optional)

**Purpose**: Create a reorder request for low/out of stock items

**Request Body**:
```json
{
  "quantity": "number (required)",
  "priority": "string (optional, 'low', 'medium', 'high')",
  "notes": "string (optional)"
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "message": "Reorder request created successfully",
  "data": {
    "id": "string",
    "feedId": "string",
    "quantity": "number",
    "priority": "string",
    "status": "string",
    "notes": "string",
    "createdAt": "string"
  }
}
```

---

## Additional Considerations

### Data Structure Requirements

The `FeedItem` interface should include the following fields:

**Required Fields**:
- `id`: Unique identifier
- `name`: Feed item name
- `type`: Feed type (layer, starter, grower, finisher, supplement)
- `stock`: Current stock quantity
- `unit`: Unit of measurement (kg, lbs, tons)
- `supplier`: Supplier name
- `status`: Calculated status (In Stock, Low Stock, Out of Stock)

**Optional Fields**:
- `category`: Feed category/classification
- `maxCapacity`: Maximum storage capacity
- `cost`: Total cost
- `costPerUnit`: Cost per unit
- `expiryDate`: Expiration date (ISO format)
- `location`: Storage location (e.g., "Warehouse A, Section 2")
- `batchNumber`: Batch or lot number
- `notes`: Additional notes
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Status Calculation Logic

The feed item status should be calculated based on stock levels relative to maximum capacity:

**Status Calculation Rules**:
1. **Out of Stock**: 
   - `stock === 0` OR `stock < 0`
   - Priority: Highest

2. **Low Stock**: 
   - `stock > 0` AND `stock < (maxCapacity * 0.3)`
   - Threshold: 30% of maximum capacity
   - Priority: Medium

3. **In Stock**: 
   - `stock >= (maxCapacity * 0.3)`
   - Priority: Low

**Implementation Notes**:
- If `maxCapacity` is not provided, use a default threshold (e.g., 100 units)
- Status should be recalculated whenever stock is updated
- Status can be stored in the database for performance, but should be recalculated on stock updates

**Example Calculation**:
```javascript
function calculateStatus(stock, maxCapacity = 100) {
  if (stock <= 0) {
    return "Out of Stock"
  }
  const threshold = maxCapacity * 0.3
  if (stock < threshold) {
    return "Low Stock"
  }
  return "In Stock"
}
```

### Filtering Support

The `GET /api/feed` endpoint should support comprehensive filtering:

**Search Functionality**:
- **Name Search**: Case-insensitive partial matching on `name` field
- **Supplier Search**: Case-insensitive partial matching on `supplier` field
- **Combined Search**: When `search` parameter is provided, search both `name` and `supplier` fields

**Type Filtering**:
- Filter by exact match on `type` field
- Supported types: `layer`, `starter`, `grower`, `finisher`, `supplement`
- Case-sensitive matching recommended

**Status Filtering**:
- Filter by calculated status: `In Stock`, `Low Stock`, `Out of Stock`
- Case-sensitive matching recommended

**Supplier Filtering**:
- Filter by exact or partial match on `supplier` field
- Case-insensitive matching recommended

**Combined Filters**:
- Multiple filters can be applied simultaneously
- All filters use AND logic (must match all specified filters)
- Example: `?type=layer&status=Low Stock&search=premium` will return layer feeds with low stock that match "premium" in name or supplier

**Pagination (Optional)**:
- Consider adding pagination for large datasets:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 50, max: 100)
- Response should include pagination metadata:
  ```json
  {
    "success": true,
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
  ```

### Error Responses

All endpoints should return consistent error responses:

**400 Bad Request**:
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Invalid request data",
  "details": {
    "field": "error message"
  }
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Feed item not found"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Frontend Integration Notes

1. **Status Colors**: The frontend uses specific color schemes for status badges:
   - In Stock: `bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300`
   - Low Stock: `bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`
   - Out of Stock: `bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`

2. **Stock Progress Bar**: The frontend displays a progress bar showing `(stock / maxCapacity) * 100`

3. **Unit Display**: Units are displayed alongside stock values (e.g., "1000 kg")

4. **Date Formatting**: Expiry dates should be formatted for display (e.g., "Jan 15, 2024")

5. **Null Safety**: The frontend handles null/undefined data gracefully, defaulting to empty arrays for lists

