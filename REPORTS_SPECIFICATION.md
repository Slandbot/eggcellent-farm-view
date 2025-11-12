# Reports & Analytics API Endpoints Specification

This document outlines all API endpoints required for the `Reports.tsx` component.

---

## Endpoints Overview 

The Reports component requires the following endpoints:

1. **GET `/api/reports/dashboard`** - Get dashboard statistics for reports
2. **GET `/api/reports/production`** - Get production report data
3. **GET `/api/reports/health`** - Get health report data
4. **GET `/api/reports/feed-consumption`** - Get feed consumption report data
5. **GET `/api/reports/financial`** - Get financial report data
6. **POST `/api/reports/generate`** - Generate a new report
7. **GET `/api/reports/:id/export`** - Export a report in specified format

---

## 1. GET `/api/reports/dashboard` - Get Dashboard Statistics

**Purpose**: Retrieve dashboard statistics for the reports page

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "totalReports": "number (total reports generated this month)",
    "automatedReports": "number (currently active automated reports)",
    "dataInsights": "number (key metrics tracked)",
    "performanceScore": "string (e.g., '94%', farm efficiency score)"
  }
}
```

---

## 2. GET `/api/reports/production` - Get Production Report

**Purpose**: Retrieve production report data for a specified time period

**Query Parameters**:
- `period` (optional): Time period for data (default: '30d', options: '7d', '30d', '90d', '1y')

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "period": "string (e.g., '30d')",
    "totalProduction": "number (total eggs collected)",
    "averageDaily": "number (average eggs per day)",
    "peakDay": {
      "date": "string (ISO date)",
      "quantity": "number"
    },
    "gradeDistribution": {
      "AA": "number",
      "A": "number",
      "B": "number",
      "C": "number"
    },
    "trends": {
      "change": "number (percentage change)",
      "direction": "string (up|down|stable)"
    },
    "dailyData": [
      {
        "date": "string (ISO date)",
        "quantity": "number",
        "gradeAA": "number",
        "gradeA": "number",
        "gradeB": "number",
        "gradeC": "number"
      }
    ]
  }
}
```

---

## 3. GET `/api/reports/health` - Get Health Report

**Purpose**: Retrieve health and treatment report data for a specified time period

**Query Parameters**:
- `period` (optional): Time period for data (default: '30d', options: '7d', '30d', '90d', '1y')

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "period": "string",
    "totalTreatments": "number",
    "activeTreatments": "number",
    "mortalityRate": "number (percentage)",
    "healthScore": "number (percentage)",
    "commonIssues": [
      {
        "issue": "string",
        "count": "number",
        "severity": "string (low|medium|high)"
      }
    ],
    "treatmentHistory": [
      {
        "date": "string (ISO date)",
        "treatment": "string",
        "birdGroup": "string",
        "outcome": "string"
      }
    ],
    "vaccinationSchedule": [
      {
        "date": "string (ISO date)",
        "vaccine": "string",
        "birdGroup": "string",
        "status": "string (scheduled|completed|missed)"
      }
    ]
  }
}
```

---

## 4. GET `/api/reports/feed-consumption` - Get Feed Consumption Report

**Purpose**: Retrieve feed consumption report data for a specified time period

**Query Parameters**:
- `period` (optional): Time period for data (default: '30d', options: '7d', '30d', '90d', '1y')

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "period": "string",
    "totalConsumption": "number (total feed consumed in kg)",
    "averageDaily": "number (average daily consumption)",
    "feedEfficiency": "number (kg per egg)",
    "costAnalysis": {
      "totalCost": "number",
      "costPerEgg": "number",
      "costPerBird": "number"
    },
    "byFeedType": [
      {
        "type": "string",
        "quantity": "number",
        "cost": "number",
        "percentage": "number"
      }
    ],
    "dailyConsumption": [
      {
        "date": "string (ISO date)",
        "quantity": "number",
        "cost": "number",
        "feedType": "string"
      }
    ]
  }
}
```

---

## 5. GET `/api/reports/financial` - Get Financial Report

**Purpose**: Retrieve financial report data for a specified time period

**Query Parameters**:
- `period` (optional): Time period for data (default: '30d', options: '7d', '30d', '90d', '1y')

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "period": "string",
    "revenue": {
      "total": "number",
      "fromEggs": "number",
      "fromBirds": "number",
      "other": "number"
    },
    "expenses": {
      "total": "number",
      "feed": "number",
      "medicine": "number",
      "labor": "number",
      "utilities": "number",
      "other": "number"
    },
    "profit": {
      "gross": "number",
      "net": "number",
      "margin": "number (percentage)"
    },
    "trends": {
      "revenueChange": "number (percentage)",
      "expenseChange": "number (percentage)",
      "profitChange": "number (percentage)"
    },
    "breakdown": [
      {
        "category": "string",
        "amount": "number",
        "percentage": "number"
      }
    ]
  }
}
```

---

## 6. POST `/api/reports/generate` - Generate Report

**Purpose**: Generate a new report with specified type and filters

**Request Body**:
```json
{
  "type": "string (required, production|health|feed|financial|overview)",
  "filters": {
    "dateFrom": "string (optional, ISO date)",
    "dateTo": "string (optional, ISO date)",
    "pens": "array<string> (optional, pen IDs)",
    "collectors": "array<string> (optional, collector names)",
    "grades": "array<string> (optional, egg grades)",
    "birdGroups": "array<string> (optional, bird group IDs)"
  },
  "format": "string (optional, pdf|excel|csv, default: pdf)"
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": {
    "id": "string (report ID)",
    "type": "string",
    "status": "string (generating|completed|failed)",
    "downloadUrl": "string (optional, URL to download report)",
    "createdAt": "string (ISO timestamp)"
  }
}
```

---

## 7. GET `/api/reports/:id/export` - Export Report

**Purpose**: Export a generated report in the specified format

**Query Parameters**:
- `format` (required): Export format (`pdf`, `excel`, `csv`)

**Response (Success - 200)**:
- For PDF: Returns PDF file with `Content-Type: application/pdf`
- For Excel: Returns Excel file with `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- For CSV: Returns CSV file with `Content-Type: text/csv`

**Response Headers**:
```
Content-Type: application/pdf (or appropriate type)
Content-Disposition: attachment; filename="report_2024-01-15.pdf"
```

**Alternative Response** (if report needs to be generated first):
```json
{
  "success": false,
  "error": "Report not ready",
  "message": "Report is still being generated. Please try again later.",
  "status": "generating"
}
```

---

## Additional Considerations

### Period Format

All period parameters should accept:
- `7d`: Last 7 days
- `30d`: Last 30 days
- `90d`: Last 90 days
- `1y`: Last year
- Custom date ranges via `dateFrom` and `dateTo` in filters

### Report Templates

Consider implementing report templates for common report configurations:

**GET `/api/reports/templates`** (Optional):
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "description": "string",
      "defaultFilters": {
        "period": "string",
        "pens": "array",
        "grades": "array"
      }
    }
  ]
}
```

### Data Aggregation

Reports should aggregate data efficiently:
- Use database aggregation queries where possible
- Cache frequently accessed reports
- Support real-time and historical data

### Currency Format

All financial values should be in Ghana Cedis (₵):
- Revenue, expenses, and profit should be numeric values
- Frontend will format with ₵ symbol
- Ensure consistent currency handling across all financial endpoints

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
  "message": "Report not found"
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

1. **Period Selection**: The frontend uses a period selector with options: 7d, 30d, 90d, 1y

2. **Report Tabs**: The frontend displays reports in tabs:
   - Overview: General farm performance
   - Production: Egg production analysis
   - Health & Medicine: Health and treatment reports
   - Financial: Financial reports

3. **Export Functionality**: The frontend supports exporting reports in PDF, Excel, and CSV formats

4. **Loading States**: All report endpoints should return data quickly or provide progress updates for long-running reports

5. **Error Handling**: The frontend displays error messages with retry functionality

6. **Data Formatting**: 
   - Dates are formatted using `toLocaleDateString()` for display
   - Currency values are formatted with ₵ symbol
   - Percentages are displayed with % symbol

7. **Empty States**: The frontend handles empty report data gracefully with informative messages

