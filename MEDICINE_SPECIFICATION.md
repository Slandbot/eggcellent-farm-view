# Medicine & Vaccines API Endpoints Specification

This document outlines all API endpoints required for the `Medicine.tsx` component.

---

## Endpoints Overview 

The Medicine component requires the following endpoints:

1. **GET `/api/medicine`** - Get medicine inventory list
2. **GET `/api/medicine/stats`** - Get medicine statistics
3. **GET `/api/medicine/treatments`** - Get treatment history
4. **POST `/api/medicine`** - Add new medicine
5. **POST `/api/medicine/treatments`** - Record a treatment
6. **PUT `/api/medicine/:id`** - Update medicine item
7. **DELETE `/api/medicine/:id`** - Delete medicine item

---

## 1. GET `/api/medicine` - Get Medicine Inventory

**Purpose**: Retrieve list of all medicines in inventory with optional filtering

**Query Parameters**:
- `type` (optional): Filter by medicine type (`vaccine`, `antibiotic`, `vitamin`, `treatment`)
- `status` (optional): Filter by stock status (`In Stock`, `Low Stock`, `Out of Stock`)
- `search` (optional): Search by medicine name (case-insensitive partial match)

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Medicine inventory retrieved successfully",
  "data": [
    {
      "id": "string",
      "name": "string",
      "type": "string (vaccine|antibiotic|vitamin|treatment)",
      "supplier": "string",
      "stock": "number",
      "unit": "string (e.g., 'ml', 'tablets', 'vials')",
      "status": "string (In Stock|Low Stock|Out of Stock)",
      "expiryDate": "string (ISO date: YYYY-MM-DD)",
      "usage": "string (optional, e.g., 'Oral', 'Injection')",
      "costPerUnit": "number (optional)",
      "location": "string (optional, storage location)",
      "batchNumber": "string (optional)",
      "notes": "string (optional)",
      "createdAt": "string (ISO timestamp)",
      "updatedAt": "string (ISO timestamp)"
    }
  ]
}
```

**Alternative Response Format** (nested structure):
```json
{
  "success": true,
  "message": "Medicine inventory retrieved successfully",
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 2. GET `/api/medicine/stats` - Get Medicine Statistics

**Purpose**: Retrieve aggregated statistics about medicine inventory

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "totalMedicines": "number",
    "lowStockItems": "number",
    "activeTreatments": "number",
    "expiringSoon": "number (medicines expiring within 30 days)",
    "totalValue": "number (optional, total inventory value)",
    "byType": {
      "vaccine": "number",
      "antibiotic": "number",
      "vitamin": "number",
      "treatment": "number"
    }
  }
}
```

---

## 3. GET `/api/medicine/treatments` - Get Treatment History

**Purpose**: Retrieve history of administered treatments

**Query Parameters**:
- `birdGroup` (optional): Filter by bird group ID
- `medicine` (optional): Filter by medicine name or ID
- `dateFrom` (optional): Start date filter (ISO date: YYYY-MM-DD)
- `dateTo` (optional): End date filter (ISO date: YYYY-MM-DD)

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Treatment history retrieved successfully",
  "data": [
    {
      "id": "string",
      "date": "string (ISO date: YYYY-MM-DD)",
      "birdGroup": "string",
      "birdGroupId": "string (alternative field name)",
      "treatment": "string (medicine name)",
      "medicineName": "string (alternative field name)",
      "medicineId": "string",
      "dosage": "string (e.g., '5ml', '2 tablets')",
      "administeredBy": "string",
      "usedBy": "string (alternative field name)",
      "adminBy": "string (alternative field name)",
      "reason": "string (treatment reason/notes)",
      "outcome": "string (optional)",
      "createdAt": "string (ISO timestamp)"
    }
  ]
}
```

**Alternative Response Format** (nested structure):
```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150
    }
  }
}
```

---

## 4. POST `/api/medicine` - Add New Medicine

**Purpose**: Add a new medicine to inventory

**Request Body**:
```json
{
  "name": "string (required)",
  "type": "string (required, vaccine|antibiotic|vitamin|treatment)",
  "supplier": "string (required)",
  "quantity": "number (required)",
  "unit": "string (required, e.g., 'ml', 'tablets', 'vials')",
  "expiryDate": "string (required, ISO date: YYYY-MM-DD)",
  "costPerUnit": "number (optional)",
  "location": "string (optional)",
  "batchNumber": "string (optional)",
  "notes": "string (optional)",
  "usage": "string (optional)"
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "message": "Medicine added successfully",
  "data": {
    "id": "string",
    "name": "string",
    "type": "string",
    "supplier": "string",
    "stock": "number",
    "unit": "string",
    "status": "string",
    "expiryDate": "string",
    "createdAt": "string"
  }
}
```

---

## 5. POST `/api/medicine/treatments` - Record Treatment

**Purpose**: Record a new treatment administration

**Request Body**:
```json
{
  "medicineId": "string (required)",
  "birdGroup": "string (required)",
  "dosage": "string (required, e.g., '5ml', '2 tablets')",
  "administeredBy": "string (required, user ID or name)",
  "date": "string (required, ISO date: YYYY-MM-DD)",
  "reason": "string (required, treatment reason/notes)",
  "outcome": "string (optional)"
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "message": "Treatment recorded successfully",
  "data": {
    "id": "string",
    "medicineId": "string",
    "birdGroup": "string",
    "dosage": "string",
    "administeredBy": "string",
    "date": "string",
    "reason": "string",
    "createdAt": "string"
  }
}
```

---

## 6. PUT `/api/medicine/:id` - Update Medicine

**Purpose**: Update an existing medicine item

**Request Body** (all fields optional):
```json
{
  "name": "string",
  "type": "string",
  "supplier": "string",
  "stock": "number",
  "unit": "string",
  "expiryDate": "string",
  "costPerUnit": "number",
  "location": "string",
  "batchNumber": "string",
  "notes": "string",
  "usage": "string"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Medicine updated successfully",
  "data": {
    "id": "string",
    "name": "string",
    "type": "string",
    "stock": "number",
    "status": "string",
    "updatedAt": "string"
  }
}
```

---

## 7. DELETE `/api/medicine/:id` - Delete Medicine

**Purpose**: Delete a medicine item from inventory

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Medicine deleted successfully"
}
```

---

## Additional Considerations

### Data Structure Requirements

The `Medicine` interface should include the following fields:

**Required Fields**:
- `id`: Unique identifier
- `name`: Medicine name
- `type`: Medicine type (vaccine, antibiotic, vitamin, treatment)
- `stock`: Current stock quantity
- `unit`: Unit of measurement (ml, tablets, vials, etc.)
- `status`: Calculated status (In Stock, Low Stock, Out of Stock)

**Optional Fields**:
- `supplier`: Supplier name
- `expiryDate`: Expiration date (ISO format: YYYY-MM-DD)
- `usage`: Usage instructions (e.g., "Oral", "Injection")
- `costPerUnit`: Cost per unit
- `location`: Storage location
- `batchNumber`: Batch or lot number
- `notes`: Additional notes
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Status Calculation Logic

The medicine item status should be calculated based on stock levels:

**Status Calculation Rules**:
1. **Out of Stock**: 
   - `stock === 0` OR `stock < 0`
   - Priority: Highest

2. **Low Stock**: 
   - `stock > 0` AND `stock < threshold` (e.g., 10 units or 20% of typical order)
   - Threshold: Configurable (default: 10 units or 20%)
   - Priority: Medium

3. **In Stock**: 
   - `stock >= threshold`
   - Priority: Low

**Implementation Notes**:
- Status should be recalculated whenever stock is updated
- Status can be stored in the database for performance, but should be recalculated on stock updates
- Consider expiry date warnings (expiring within 30 days)

### Filtering Support

The `GET /api/medicine` endpoint should support comprehensive filtering:

**Search Functionality**:
- **Name Search**: Case-insensitive partial matching on `name` field
- When `search` parameter is provided, search the `name` field

**Type Filtering**:
- Filter by exact match on `type` field
- Supported types: `vaccine`, `antibiotic`, `vitamin`, `treatment`
- Case-sensitive matching recommended

**Status Filtering**:
- Filter by calculated status: `In Stock`, `Low Stock`, `Out of Stock`
- Case-sensitive matching recommended

**Combined Filters**:
- Multiple filters can be applied simultaneously
- All filters use AND logic (must match all specified filters)
- Example: `?type=vaccine&status=Low Stock&search=flu` will return vaccines with low stock that match "flu" in name

**Pagination (Optional)**:
- Consider adding pagination for large datasets:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 50, max: 100)
- Response should include pagination metadata

### Treatment History Field Mapping

The frontend handles multiple field name variations:
- `birdGroup` or `birdGroupId` → both map to bird group
- `treatment` or `medicineName` → both map to treatment name
- `administeredBy` or `usedBy` or `adminBy` → all map to administrator

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
  "message": "Medicine not found"
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

2. **Type Colors**: The frontend uses specific color schemes for type badges:
   - Vaccine: `bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`
   - Antibiotic: `bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300`
   - Vitamin: `bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`
   - Treatment: `bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300`

3. **Date Formatting**: Expiry dates should be formatted for display (e.g., "Jan 15, 2024")

4. **Null Safety**: The frontend handles null/undefined data gracefully, defaulting to empty arrays for lists

5. **Nested Response Handling**: The frontend handles nested API response structures like `{ data: { data: [...] } }`

6. **Field Mapping**: The frontend maps both legacy and new field names for backward compatibility

7. **Filter Handling**: Empty string filters are converted to "all" for Select components (Radix UI requirement)

8. **Statistics Display**: Stats cards show API data with fallback to calculated values from the medicines array

