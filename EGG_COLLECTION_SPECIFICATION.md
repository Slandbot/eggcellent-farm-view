# Egg Collection Endpoints Specification

This document outlines the implementation details for all egg collection endpoints and data requirements.

## Base Configuration

- **Base URL**: `http://localhost:3000/api` (configurable via `VITE_API_BASE_URL` environment variable)
- **Content-Type**: `application/json`
- **Authorization Header**: `Bearer <token>` (for protected endpoints)

---

## Endpoints 

### 1. GET `/api/eggs` - Get Egg Collections List

**Purpose**: Retrieve all egg collection records with optional filtering

**Query Parameters**:
- `date` (optional): Filter by collection date (ISO date format: YYYY-MM-DD)
- `shift` (optional): Filter by shift (Morning, Afternoon, Evening)
- `pen` (optional): Filter by pen location (e.g., "A1", "B2", "C3")
- `grade` (optional): Filter by egg grade (AA, A, B, C)
- `search` (optional): Search by collector name or pen location (case-insensitive)

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Egg collections retrieved successfully",
  "data": {
    "data": [
      {
        "id": "string",
        "date": "string (ISO date: YYYY-MM-DD)",
        "shift": "string (Morning | Afternoon | Evening)",
        "pen": "string",
        "quantity": "number",
        "collected": "number (legacy, prefer 'quantity')",
        "grade": "string (AA | A | B | C)",
        "quality": "string (legacy, prefer 'grade')",
        "avgWeight": "number (optional, in grams)",
        "weight": "number (optional, legacy field)",
        "collector": "string",
        "collectedBy": "string (legacy, prefer 'collector')",
        "broken": "number (optional)",
        "notes": "string (optional)",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 150,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Note**: The response may have nested structure `{ data: { data: [...] } }` which the frontend handles.

---

### 2. GET `/api/eggs/stats` - Get Egg Collection Statistics

**Purpose**: Get aggregated statistics for dashboard cards

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "todayCollection": "number",
    "todayChange": "string (e.g., '+5% from yesterday')",
    "weeklyTotal": "number",
    "weeklyChange": "string (e.g., '+8% from last week')",
    "monthlyTotal": "number",
    "monthlyChange": "string (e.g., '+12% from last month')",
    "avgPerBird": "number",
    "dailyProduction": "number (optional)",
    "productionChange": "string (optional)",
    "productionTrend": "up" | "down" | "stable" (optional)",
    "avgWeight": "string (optional, e.g., '58g')",
    "gradeAARate": "string (optional, e.g., '68%')"
  }
}
```

---

### 3. POST `/api/eggs` - Record New Egg Collection

**Purpose**: Create a new egg collection record

**Request Body**:
```json
{
  "date": "string (required, ISO date: YYYY-MM-DD)",
  "shift": "string (required, Morning | Afternoon | Evening)",
  "pen": "string (required)",
  "quantity": "number (required)",
  "grade": "string (required, AA | A | B | C)",
  "avgWeight": "string (optional, e.g., '58g')",
  "collector": "string (optional)",
  "notes": "string (optional)"
}
```

**Alternative Request Body** (for backward compatibility):
```json
{
  "date": "string (required)",
  "shift": "string (required)",
  "pen": "string (required)",
  "gradeA": "number (required)",
  "gradeB": "number (optional)",
  "cracked": "number (optional)",
  "collectedBy": "string (required)",
  "notes": "string (optional)"
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "message": "Egg collection recorded successfully",
  "data": {
    "id": "string",
    "date": "string",
    "shift": "string",
    "pen": "string",
    "quantity": "number",
    "grade": "string",
    "avgWeight": "string",
    "collector": "string",
    "notes": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### 4. PUT `/api/eggs/:id` - Update Egg Collection

**Purpose**: Update an existing egg collection record

**Request Body** (all fields optional):
```json
{
  "date": "string (ISO date)",
  "shift": "string",
  "pen": "string",
  "quantity": "number",
  "grade": "string",
  "avgWeight": "string",
  "collector": "string",
  "notes": "string"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Egg collection updated successfully",
  "data": {
    "id": "string",
    "date": "string",
    "shift": "string",
    "pen": "string",
    "quantity": "number",
    "grade": "string",
    "avgWeight": "string",
    "collector": "string",
    "notes": "string",
    "updatedAt": "string"
  }
}
```

---

### 5. DELETE `/api/eggs/:id` - Delete Egg Collection

**Purpose**: Remove an egg collection record

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Egg collection deleted successfully",
  "data": {
    "id": "string"
  }
}
```

---

### 6. GET `/api/eggs/production-chart` - Get Production Chart Data

**Purpose**: Retrieve production data for chart visualization

**Query Parameters**:
- `period` (optional): Time period for data (default: '7d', options: '7d', '30d', '90d', '1y')

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "labels": ["string (dates)"],
    "datasets": [
      {
        "label": "string",
        "data": [number],
        "backgroundColor": "string (optional)",
        "borderColor": "string (optional)"
      }
    ],
    "period": "string",
    "totalProduction": "number",
    "averageDaily": "number"
  }
}
```

**Alternative Response Format** (if using different chart library):
```json
{
  "success": true,
  "data": [
    {
      "date": "string",
      "quantity": "number",
      "gradeAA": "number",
      "gradeA": "number",
      "gradeB": "number",
      "total": "number"
    }
  ]
}
```

---

## Additional Considerations

### Data Structure Requirements

The `EggCollection` interface should include the following fields:

**Required Fields**:
- `id`: Unique identifier
- `date`: Collection date (ISO format: YYYY-MM-DD)
- `shift`: Shift name (Morning, Afternoon, Evening)
- `pen`: Pen location identifier
- `quantity`: Number of eggs collected
- `grade`: Egg grade (AA, A, B, C)

**Optional Fields**:
- `collected`: Legacy field for quantity (prefer `quantity`)
- `quality`: Legacy field for grade (prefer `grade`)
- `avgWeight`: Average weight per egg (e.g., "58g")
- `weight`: Legacy field for average weight
- `collector`: Name of person who collected eggs
- `collectedBy`: Legacy field for collector (prefer `collector`)
- `broken`: Number of broken eggs
- `notes`: Additional notes
- `createdAt`: Creation timestamp (ISO format)
- `updatedAt`: Last update timestamp (ISO format)

### Field Mapping

The frontend handles both legacy and new field names:
- `quantity` or `collected` → both map to quantity
- `grade` or `quality` → both map to grade
- `collector` or `collectedBy` → both map to collector
- `avgWeight` or `weight` → both map to average weight

### Filtering Support

The `GET /api/eggs` endpoint should support comprehensive filtering:

**Search Functionality**:
- **Collector Search**: Case-insensitive partial matching on `collector` or `collectedBy` field
- **Pen Search**: Case-insensitive partial matching on `pen` field
- **Combined Search**: When `search` parameter is provided, search both `collector` and `pen` fields

**Date Filtering**:
- Filter by exact match on `date` field
- Format: ISO date string (YYYY-MM-DD)
- Example: `?date=2024-01-15`

**Shift Filtering**:
- Filter by exact match on `shift` field
- Supported values: `Morning`, `Afternoon`, `Evening`
- Case-sensitive matching recommended

**Grade Filtering**:
- Filter by exact match on `grade` field
- Supported values: `AA`, `A`, `B`, `C`
- Case-sensitive matching recommended

**Pen Filtering**:
- Filter by exact or partial match on `pen` field
- Case-insensitive matching recommended

**Combined Filters**:
- Multiple filters can be applied simultaneously
- All filters use AND logic (must match all specified filters)
- Example: `?date=2024-01-15&shift=Morning&grade=AA` will return morning collections from Jan 15 with AA grade

**Pagination (Optional)**:
- Consider adding pagination for large datasets:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 50, max: 100)
- Response should include pagination metadata:
  ```json
  {
    "success": true,
    "data": {
      "data": [...],
      "pagination": {
        "page": 1,
        "limit": 50,
        "total": 150,
        "totalPages": 3,
        "hasNext": true,
        "hasPrev": false
      }
    }
  }
  ```

### Grade Values

Supported egg grades:
- **AA**: Premium quality (highest grade)
- **A**: Standard quality
- **B**: Lower quality
- **C**: Lowest quality

### Shift Values

Supported shift values:
- **Morning**: Morning collection shift
- **Afternoon**: Afternoon collection shift
- **Evening**: Evening collection shift

### Statistics Calculation

The `GET /api/eggs/stats` endpoint should calculate:

1. **Today's Collection**:
   - Sum of all collections for today's date
   - Compare with yesterday's total for `todayChange`

2. **Weekly Total**:
   - Sum of all collections in the current week (last 7 days)
   - Compare with previous week for `weeklyChange`

3. **Monthly Total**:
   - Sum of all collections in the current month
   - Compare with previous month for `monthlyChange`

4. **Average Weight**:
   - Calculate average weight across all collections
   - Format as string with unit (e.g., "58g")

5. **Grade AA Rate**:
   - Calculate percentage of AA grade eggs
   - Format as string with percentage (e.g., "68%")

6. **Average Per Bird**:
   - Calculate average eggs per bird (if bird count data is available)
   - Formula: `totalCollections / totalBirds`

**Implementation Notes**:
- Statistics should be calculated in real-time or cached with appropriate refresh intervals
- Date comparisons should use timezone-aware calculations
- Percentage changes should handle division by zero (e.g., if yesterday had 0 eggs, show "+100%" or "N/A")
- All numeric values should be rounded appropriately (e.g., percentages to 1 decimal place)

**Example Calculation**:
```javascript
function calculateTodayCollection(collections, today) {
  const todayCollections = collections.filter(c => c.date === today)
  const total = todayCollections.reduce((sum, c) => sum + (c.quantity || 0), 0)
  return total
}

function calculateGradeAARate(collections) {
  if (collections.length === 0) return "0%"
  const aaCount = collections.filter(c => c.grade === "AA").length
  const percentage = (aaCount / collections.length) * 100
  return `${percentage.toFixed(0)}%`
}
```

### Grade Distribution Logic

The system should track and calculate grade distribution:

**Grade Distribution Rules**:
1. **Grade AA**: Premium quality eggs (highest grade)
   - Typically largest and highest quality
   - Highest market value

2. **Grade A**: Standard quality eggs
   - Good quality, standard size
   - Most common grade

3. **Grade B**: Lower quality eggs
   - Smaller or slightly imperfect
   - Lower market value

4. **Grade C**: Lowest quality eggs
   - Smallest or damaged eggs
   - May be used for processing rather than direct sale

**Grade Calculation** (if not provided by user):
- Can be calculated based on weight and quality metrics
- Should follow industry standards for egg grading
- Default to "A" if not specified

### Date and Time Handling

**Date Format**:
- All dates should be in ISO 8601 format: `YYYY-MM-DD`
- Timezone: Use server timezone or UTC
- Date comparisons should be timezone-aware

**Shift Timing**:
- **Morning**: Typically 6:00 AM - 12:00 PM
- **Afternoon**: Typically 12:00 PM - 6:00 PM
- **Evening**: Typically 6:00 PM - 12:00 AM

**Implementation Notes**:
- When filtering by date, ensure consistent date format handling
- Date ranges should be inclusive of start and end dates
- Consider timezone conversions for multi-location farms

### Validation Rules

**Required Field Validation**:
- `date`: Must be a valid date in YYYY-MM-DD format, cannot be in the future
- `shift`: Must be one of: "Morning", "Afternoon", "Evening"
- `pen`: Must be a non-empty string
- `quantity`: Must be a positive integer (greater than 0)
- `grade`: Must be one of: "AA", "A", "B", "C"

**Optional Field Validation**:
- `avgWeight`: Should be a string with unit (e.g., "58g", "2.0oz")
- `collector`: Should be a non-empty string if provided
- `notes`: Can be any string, max length recommended: 500 characters

**Business Logic Validation**:
- Quantity should be reasonable (e.g., not exceed 10,000 per collection)
- Date should not be more than 30 days in the past (configurable)
- Pen location should match existing pen identifiers in the system

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
  "message": "Egg collection not found"
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

1. **Grade Colors**: The frontend uses specific color schemes for grade badges:
   - Grade AA: `bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300`
   - Grade A: `bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`
   - Grade B: `bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`
   - Default: `bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`

2. **Date Formatting**: 
   - Dates are displayed using `toLocaleDateString()` for user-friendly formatting
   - Input fields use ISO date format (YYYY-MM-DD) for date pickers
   - Date comparisons use ISO format strings

3. **Null Safety**: 
   - The frontend handles null/undefined data gracefully
   - Defaults to empty arrays for lists
   - Shows "N/A" for missing values
   - Uses nullish coalescing (`??`) for better handling of `0` values

4. **Nested Response Handling**: 
   - The frontend handles nested API response structures like `{ data: { data: [...] } }`
   - Extracts arrays from nested `data.data` structures
   - Handles pagination metadata if present

5. **Field Mapping**: 
   - The frontend maps both legacy and new field names for backward compatibility
   - `quantity` or `collected` → both map to quantity
   - `grade` or `quality` → both map to grade
   - `collector` or `collectedBy` → both map to collector
   - `avgWeight` or `weight` → both map to average weight

6. **Filter Handling**:
   - Empty string filters are converted to "all" for Select components (Radix UI requirement)
   - Filters are applied client-side if API doesn't support all filter types
   - Search filter triggers on input change with debouncing (optional)

7. **Statistics Display**:
   - Stats cards show API data with fallback to calculated values
   - Uses nullish coalescing to properly handle `0` values
   - Percentage changes displayed with trend indicators (↗, ↘)

8. **Production Chart**:
   - Chart component expects data in specific format
   - Handles different chart library formats
   - Supports multiple time periods (7d, 30d, 90d, 1y)

9. **Form Validation**:
   - Required fields are marked with asterisk (*)
   - Date picker prevents future dates
   - Quantity input accepts only positive numbers
   - Grade and shift use dropdowns to ensure valid values

10. **Data Normalization**:
    - Handles different API response formats
    - Normalizes field names for consistent display
    - Ensures all numeric fields are properly typed
    - Formats dates consistently across the component

