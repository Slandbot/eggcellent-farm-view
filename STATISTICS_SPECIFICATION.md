# Statistics API Endpoints Specification

This document outlines all API endpoints required for the `Statistics.tsx` component (via `StatisticsDashboard.tsx`).

---

## Endpoints Overview

The Statistics component requires the following endpoints:

### Dashboard Statistics
1. **GET `/api/stats/dashboard`** - Get dashboard overview statistics
2. **GET `/api/stats/daily`** - Get daily statistics
3. **GET `/api/stats/weekly`** - Get weekly statistics
4. **GET `/api/stats/monthly`** - Get monthly statistics

### Trends & Analysis
5. **GET `/api/stats/trends`** - Get performance trends
6. **GET `/api/stats/eggs/grade-distribution`** - Get egg grade distribution
7. **GET `/api/stats/pens/performance`** - Get pen performance metrics
8. **GET `/api/stats/collectors/performance`** - Get collector performance metrics

### Production Statistics
9. **GET `/api/stats/eggs/production`** - Get egg production statistics
10. **GET `/api/stats/eggs/trends`** - Get production trends
11. **GET `/api/stats/eggs/daily-summary`** - Get daily production summary
12. **GET `/api/stats/eggs/monthly-summary`** - Get monthly production summary

### Financial Statistics
13. **GET `/api/stats/financial/summary`** - Get financial summary
14. **GET `/api/stats/financial/revenue-trends`** - Get revenue trends
15. **GET `/api/stats/financial/cost-analysis`** - Get cost analysis
16. **GET `/api/stats/financial/profit-margins`** - Get profit margins

### Performance Statistics
17. **GET `/api/stats/performance/overview`** - Get performance overview
18. **GET `/api/stats/performance/efficiency`** - Get efficiency metrics
19. **GET `/api/stats/performance/productivity`** - Get productivity metrics

### Comparative Statistics
20. **GET `/api/stats/comparative/period`** - Get period comparison
21. **GET `/api/stats/comparative/year-over-year`** - Get year-over-year comparison
22. **GET `/api/stats/comparative/benchmarks`** - Get benchmark comparison

### Export & Templates
23. **GET `/api/stats/export/templates`** - Get report templates
24. **POST `/api/stats/export/report`** - Export statistics report

---

## 1. GET `/api/stats/dashboard` - Get Dashboard Statistics

**Purpose**: Retrieve comprehensive dashboard statistics

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "totalBirds": "number",
    "todayEggs": "number",
    "revenue": "number (in Ghana Cedis)",
    "performanceScore": "string (e.g., '94%')",
    "feedStock": "number (optional)",
    "healthAlerts": "number (optional)"
  }
}
```

---

## 2. GET `/api/stats/daily` - Get Daily Statistics

**Purpose**: Retrieve daily statistics

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "date": "string (ISO date)",
    "eggsCollected": "number",
    "birdsCount": "number",
    "feedConsumed": "number",
    "revenue": "number",
    "expenses": "number"
  }
}
```

---

## 3. GET `/api/stats/weekly` - Get Weekly Statistics

**Purpose**: Retrieve weekly statistics

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "weekStart": "string (ISO date)",
    "weekEnd": "string (ISO date)",
    "totalEggs": "number",
    "averageDaily": "number",
    "totalRevenue": "number",
    "totalExpenses": "number",
    "netProfit": "number"
  }
}
```

---

## 4. GET `/api/stats/monthly` - Get Monthly Statistics

**Purpose**: Retrieve monthly statistics

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "month": "string (YYYY-MM)",
    "totalEggs": "number",
    "averageDaily": "number",
    "totalRevenue": "number",
    "totalExpenses": "number",
    "netProfit": "number",
    "profitMargin": "number (percentage)"
  }
}
```

---

## 5. GET `/api/stats/trends` - Get Performance Trends

**Purpose**: Retrieve performance trends data

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "eggProduction": {
      "current": "number",
      "previous": "number",
      "change": "number (percentage)",
      "trend": "string (up|down|neutral)"
    },
    "feedEfficiency": {
      "current": "number",
      "previous": "number",
      "change": "number (percentage)",
      "trend": "string (up|down|neutral)"
    },
    "revenue": {
      "current": "number",
      "previous": "number",
      "change": "number (percentage)",
      "trend": "string (up|down|neutral)"
    }
  }
}
```

---

## 6. GET `/api/stats/eggs/grade-distribution` - Get Grade Distribution

**Purpose**: Retrieve egg grade distribution statistics

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "gradeA": {
      "count": "number",
      "percentage": "number"
    },
    "gradeB": {
      "count": "number",
      "percentage": "number"
    },
    "cracked": {
      "count": "number",
      "percentage": "number"
    },
    "total": "number"
  }
}
```

**Note**: Frontend may also expect `gradeAA` if using AA grade classification.

---

## 7. GET `/api/stats/pens/performance` - Get Pen Performance

**Purpose**: Retrieve performance metrics for each pen

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": [
    {
      "penId": "string",
      "penName": "string",
      "birdCount": "number",
      "eggProduction": "number",
      "efficiency": "number (percentage)",
      "rank": "number (1-based ranking)"
    }
  ]
}
```

---

## 8. GET `/api/stats/collectors/performance` - Get Collector Performance

**Purpose**: Retrieve performance metrics for each collector

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": [
    {
      "collectorId": "string",
      "collectorName": "string",
      "totalCollections": "number",
      "averagePerDay": "number",
      "efficiency": "number (percentage)",
      "rank": "number"
    }
  ]
}
```

---

## 9. GET `/api/stats/eggs/production` - Get Egg Production Statistics

**Purpose**: Retrieve comprehensive egg production statistics

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "totalProduction": "number",
    "averageDaily": "number",
    "peakDay": {
      "date": "string (ISO date)",
      "quantity": "number"
    },
    "gradeDistribution": {
      "AA": "number",
      "A": "number",
      "B": "number",
      "C": "number"
    }
  }
}
```

---

## 10. GET `/api/stats/eggs/trends` - Get Production Trends

**Purpose**: Retrieve egg production trends over time

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "period": "string",
    "dataPoints": [
      {
        "date": "string (ISO date)",
        "quantity": "number",
        "gradeAA": "number",
        "gradeA": "number",
        "gradeB": "number"
      }
    ],
    "trend": "string (increasing|decreasing|stable)"
  }
}
```

---

## 11. GET `/api/stats/eggs/daily-summary` - Get Daily Production Summary

**Purpose**: Retrieve daily production summary

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "date": "string (ISO date)",
    "totalEggs": "number",
    "byGrade": {
      "AA": "number",
      "A": "number",
      "B": "number",
      "C": "number"
    },
    "byShift": {
      "Morning": "number",
      "Afternoon": "number",
      "Evening": "number"
    }
  }
}
```

---

## 12. GET `/api/stats/eggs/monthly-summary` - Get Monthly Production Summary

**Purpose**: Retrieve monthly production summary

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "month": "string (YYYY-MM)",
    "totalEggs": "number",
    "averageDaily": "number",
    "peakDay": {
      "date": "string",
      "quantity": "number"
    },
    "byGrade": {
      "AA": "number",
      "A": "number",
      "B": "number",
      "C": "number"
    }
  }
}
```

---

## 13. GET `/api/stats/financial/summary` - Get Financial Summary

**Purpose**: Retrieve financial summary statistics

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "totalRevenue": "number (in Ghana Cedis)",
    "totalExpenses": "number (in Ghana Cedis)",
    "netProfit": "number (in Ghana Cedis)",
    "profitMargin": "number (percentage)"
  }
}
```

---

## 14. GET `/api/stats/financial/revenue-trends` - Get Revenue Trends

**Purpose**: Retrieve revenue trends over time

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "period": "string",
    "dataPoints": [
      {
        "date": "string (ISO date)",
        "revenue": "number",
        "source": "string (eggs|birds|other)"
      }
    ],
    "trend": "string (increasing|decreasing|stable)"
  }
}
```

---

## 15. GET `/api/stats/financial/cost-analysis` - Get Cost Analysis

**Purpose**: Retrieve cost analysis breakdown

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "totalCost": "number",
    "byCategory": [
      {
        "category": "string (feed|medicine|labor|utilities|other)",
        "amount": "number",
        "percentage": "number"
      }
    ],
    "costPerEgg": "number",
    "costPerBird": "number"
  }
}
```

---

## 16. GET `/api/stats/financial/profit-margins` - Get Profit Margins

**Purpose**: Retrieve profit margin analysis

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "grossMargin": "number (percentage)",
    "netMargin": "number (percentage)",
    "byPeriod": [
      {
        "period": "string",
        "margin": "number"
      }
    ]
  }
}
```

---

## 17. GET `/api/stats/performance/overview` - Get Performance Overview

**Purpose**: Retrieve overall performance metrics

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "overallScore": "number (0-100)",
    "productionEfficiency": "number (percentage)",
    "feedEfficiency": "number (percentage)",
    "healthScore": "number (percentage)",
    "financialHealth": "number (percentage)"
  }
}
```

---

## 18. GET `/api/stats/performance/efficiency` - Get Efficiency Metrics

**Purpose**: Retrieve efficiency metrics

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "feedEfficiency": "number (kg per egg)",
    "productionEfficiency": "number (eggs per bird)",
    "laborEfficiency": "number",
    "resourceUtilization": "number (percentage)"
  }
}
```

---

## 19. GET `/api/stats/performance/productivity` - Get Productivity Metrics

**Purpose**: Retrieve productivity metrics

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "eggsPerBird": "number",
    "eggsPerDay": "number",
    "collectionRate": "number (percentage)",
    "qualityScore": "number (percentage)"
  }
}
```

---

## 20. GET `/api/stats/comparative/period` - Get Period Comparison

**Purpose**: Compare statistics across different periods

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "currentPeriod": {
      "start": "string (ISO date)",
      "end": "string (ISO date)",
      "metrics": {
        "totalEggs": "number",
        "revenue": "number",
        "expenses": "number"
      }
    },
    "previousPeriod": {
      "start": "string (ISO date)",
      "end": "string (ISO date)",
      "metrics": {
        "totalEggs": "number",
        "revenue": "number",
        "expenses": "number"
      }
    },
    "changes": {
      "eggsChange": "number (percentage)",
      "revenueChange": "number (percentage)",
      "expenseChange": "number (percentage)"
    }
  }
}
```

---

## 21. GET `/api/stats/comparative/year-over-year` - Get Year-over-Year Comparison

**Purpose**: Compare current year with previous year

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "currentYear": "number (YYYY)",
    "previousYear": "number (YYYY)",
    "metrics": {
      "totalEggs": {
        "current": "number",
        "previous": "number",
        "change": "number (percentage)"
      },
      "revenue": {
        "current": "number",
        "previous": "number",
        "change": "number (percentage)"
      }
    }
  }
}
```

---

## 22. GET `/api/stats/comparative/benchmarks` - Get Benchmark Comparison

**Purpose**: Compare farm performance against industry benchmarks

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "farmMetrics": {
      "eggsPerBird": "number",
      "feedEfficiency": "number",
      "mortalityRate": "number"
    },
    "industryBenchmarks": {
      "eggsPerBird": "number",
      "feedEfficiency": "number",
      "mortalityRate": "number"
    },
    "comparison": {
      "eggsPerBird": "string (above|below|at)",
      "feedEfficiency": "string (above|below|at)",
      "mortalityRate": "string (above|below|at)"
    }
  }
}
```

---

## 23. GET `/api/stats/export/templates` - Get Report Templates

**Purpose**: Retrieve available report templates

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "type": "string",
      "defaultFilters": {
        "period": "string",
        "pens": "array",
        "grades": "array"
      }
    }
  ]
}
```

---

## 24. POST `/api/stats/export/report` - Export Statistics Report

**Purpose**: Export statistics report in specified format

**Request Body**:
```json
{
  "templateId": "string (optional)",
  "dateRange": {
    "start": "string (ISO date)",
    "end": "string (ISO date)"
  },
  "format": "string (required, pdf|excel|csv)",
  "filters": {
    "pens": "array<string> (optional)",
    "collectors": "array<string> (optional)",
    "grades": "array<string> (optional)"
  }
}
```

**Response (Success - 200)**:
- For PDF: Returns PDF file with `Content-Type: application/pdf`
- For Excel: Returns Excel file with appropriate content type
- For CSV: Returns CSV file with `Content-Type: text/csv`

**Alternative Response** (if report generation takes time):
```json
{
  "success": true,
  "message": "Report generation started",
  "data": {
    "reportId": "string",
    "status": "generating",
    "estimatedCompletion": "string (ISO timestamp)"
  }
}
```

---

## Additional Considerations

### Currency Format

All financial values should be in Ghana Cedis (₵):
- Revenue, expenses, and profit should be numeric values
- Frontend will format with ₵ symbol
- Ensure consistent currency handling across all financial endpoints

### Performance Optimization

Statistics endpoints should be optimized for performance:
- Use database aggregation queries
- Cache frequently accessed statistics
- Support pagination for large datasets
- Consider background job processing for complex calculations

### Data Aggregation

Statistics should aggregate data efficiently:
- Use database views or materialized views where appropriate
- Pre-calculate common statistics
- Support real-time and historical data

### Trend Calculation

Trend calculations should:
- Compare current period with previous period
- Handle edge cases (e.g., division by zero)
- Provide meaningful trend indicators (up, down, neutral)

### Error Responses

All endpoints should return consistent error responses:

**400 Bad Request**:
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Invalid request data"
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

1. **Currency Display**: All currency values are displayed with ₵ symbol (Ghana Cedis)

2. **Trend Icons**: The frontend uses specific icons for trends:
   - Up: `TrendingUp` icon with green color
   - Down: `TrendingDown` icon with red color
   - Neutral: `Minus` icon with gray color

3. **Loading States**: All statistics endpoints should return data quickly or provide progress updates

4. **Error Handling**: The frontend displays error messages with retry functionality

5. **Data Formatting**:
   - Dates are formatted using `toLocaleDateString()` for display
   - Currency values are formatted with ₵ symbol and thousand separators
   - Percentages are displayed with % symbol

6. **Export Functionality**: The frontend supports exporting reports in PDF, Excel, and CSV formats

7. **Performance Metrics**: The frontend displays performance scores and efficiency metrics with appropriate color coding

8. **Empty States**: The frontend handles empty statistics data gracefully with informative messages

