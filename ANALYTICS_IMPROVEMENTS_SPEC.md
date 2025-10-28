# Analytics Views Improvements Specification

**Date:** 2025-10-28  
**Scope:** Fix and enhance analytics dashboard visualizations

---

## 1. Issues & Required Changes

### 1.1 Timeline Chart (Línea de Tiempo)
**Issue:** Shows multiple lines instead of one line per professor  
**Expected:** One line per professor showing project count over time

**Changes Required (FE-Only):**
- [ ] Fix chart rendering to properly group data by professor
- [ ] Ensure each professor gets exactly one line
- [ ] Verify legend displays correctly
- [ ] Test with various data sizes

---

### 1.2 Heatmap (Mapa de Calor)
**Issue:** 
- Collapsed/not rendering correctly when data is large
- Requires tab switch to load

**Changes Required (FE-Only):**
- [ ] Fix initial rendering - force chart to display on first load
- [ ] Handle large datasets without collapsing
- [ ] Increase container height or add scrolling if needed
- [ ] Ensure responsive sizing
- [ ] Add loading state indicator

**Possible Causes:**
- Chart container height issue
- Data not properly structured
- Re-render dependency missing

---

### 1.3 Network Graph (Red/Grafo)
**Current:** Basic professor collaboration network

**Enhancements Required:**

#### a) Edge Weight Labels (FE-Only)
- [ ] Display weight/collaboration count on edges
- [ ] Position labels in center of edges
- [ ] Make labels readable (adjust font size, background)
- [ ] Show tooltip on hover

#### b) Force Layout (FE-Only)
- [ ] Implement force-directed layout algorithm
- [ ] Nodes with more edges should be centered
- [ ] Adjust spring forces for better spacing
- [ ] Add node repulsion to prevent overlap
- [ ] Make layout smooth/animated on load

#### c) Node Size Proportional to Projects (FE + BE)
- [ ] Size nodes based on professor project count in date range
- [ ] Scale proportionally (min-max normalization)
- [ ] Update when filters change
- [ ] **BE Required:** Project count per professor needs to be in the network response

---

### 1.4 Statistics (Estadísticas)
**Current:** Uses Career dimension for stats

**Changes Required:**

#### a) Change from Career to Project Type (FE + BE)
- [ ] Update chart to show project type (THESIS vs FINAL_PROJECT) instead of career
- [ ] Keep same visualization structure
- [ ] **BE Required:** Update response format to group by project type

#### b) Add Additional Statistics (FE + BE)
- [ ] Total projects (overall)
- [ ] Total projects (with applied filters)
- [ ] Total unique domains
- [ ] Total unique tags
- [ ] Top-K domains (configurable, e.g., top 5)
- [ ] Top-K tags (configurable, e.g., top 5)
- [ ] Top-K professors by project count (configurable, e.g., top 5)

**Display Format:**
- Create stat cards/blocks showing:
  - Key metrics (counts)
  - Lists for top-K items
  - Compare filtered vs unfiltered counts

**BE Changes Required:**
- [ ] New endpoint or enhanced existing endpoint for detailed stats
- [ ] Include top-K lists in response
- [ ] Support filtering

---

### 1.5 Filters - Professor Filter
**Issue:** Showing students instead of just professors

**Changes Required (FE-Only):**
- [ ] Filter logic to exclude students
- [ ] Only show people with DIRECTOR or CO_DIRECTOR roles
- [ ] Verify in both browse and analytics contexts

---

## 2. Backend API Changes Required

### 2.1 Network Graph Enhancement
**Endpoint:** `GET /analytics/professor-network`

**Current Response:**
```json
{
  "nodes": [
    { "id": "uuid", "name": "string", "projectCount": 0 }
  ],
  "edges": [
    { "source": "uuid", "target": "uuid", "weight": 0, "collaborations": 0 }
  ]
}
```

**Updated Response:**
```json
{
  "nodes": [
    { 
      "id": "uuid", 
      "name": "string", 
      "projectCount": 5  // Projects in selected date range
    }
  ],
  "edges": [
    { 
      "source": "uuid", 
      "target": "uuid", 
      "weight": 3,  // Number of collaborations
      "collaborations": 3  // Same as weight for compatibility
    }
  ]
}
```

**Implementation Notes:**
- `projectCount` should reflect projects in the date range (fromYear/toYear filters)
- `weight` should represent collaboration count

---

### 2.2 Career Year Stats → Project Type Stats
**Endpoint:** `GET /analytics/career-year-stats`

**Current Response:**
```json
{
  "data": [
    { "careerId": "uuid", "careerName": "string", "year": 2023, "projectCount": 5 }
  ]
}
```

**New Endpoint (separate):** `GET /analytics/project-type-stats`

**Response:**
```json
{
  "data": [
    { 
      "projectType": "THESIS",  // or "FINAL_PROJECT"
      "year": 2023, 
      "projectCount": 15,
      "displayName": "Tesis"
    },
    { 
      "projectType": "FINAL_PROJECT", 
      "year": 2023, 
      "projectCount": 8,
      "displayName": "Trabajo Final"
    }
  ]
}
```

**Note:** Keep existing endpoint for backward compatibility

---

### 2.3 Dashboard Statistics Endpoint (NEW)
**Endpoint:** `GET /analytics/dashboard-stats`

**Response:**
```json
{
  "overview": {
    "totalProjects": 150,
    "filteredProjects": 42,
    "uniqueDomains": 12,
    "uniqueTags": 35,
    "uniqueProfessors": 18
  },
  "topDomains": [
    { "id": "uuid", "name": "Machine Learning", "count": 8 },
    { "id": "uuid", "name": "Web Development", "count": 6 },
    ...
  ],
  "topTags": [
    { "id": "uuid", "name": "Python", "count": 12 },
    { "id": "uuid", "name": "AI", "count": 10 },
    ...
  ],
  "topProfessors": [
    { "id": "uuid", "name": "Dr. Smith", "projectCount": 5 },
    { "id": "uuid", "name": "Dr. Jones", "projectCount": 4 },
    ...
  ]
}
```

**Query Parameters:**
- `page` (int): Page number (0-based)
- `size` (int): Page size
- All existing filters: `careerIds`, `professorIds`, `fromYear`, `toYear`, `projectTypes`, `applicationDomainIds`
- `topK` (int): Number of top items to return (default: 5, max: 20)

**Notes:**
- `totalProjects`: All projects in system
- `filteredProjects`: Projects matching current filters
- `topDomains/Tags/Professors`: Respect applied filters
- Response includes both overall and filtered stats for comparison

---

### 2.4 Filter Endpoint Enhancement
**Endpoint:** `GET /analytics/filters`

**Current Response:**
```json
{
  "careers": [...],
  "professors": [...],
  "applicationDomains": [...],
  "yearRange": {...}
}
```

**Fix Required:**
- Ensure `professors` list only includes users with DIRECTOR or CO_DIRECTOR roles
- Filter out students/collaborators
- Verify at database query level, not just in application code

---

## 3. Frontend Implementation Priority

### High Priority (Critical)
1. Fix Timeline chart (one line per professor)
2. Fix Heatmap rendering/loading
3. Fix Professor filter showing students

### Medium Priority (Enhancements)
1. Network graph force layout
2. Network graph edge labels
3. Network graph node sizing
4. Statistics: Add new stat cards
5. Statistics: Change to project type view

### Low Priority (Nice-to-have)
1. Loading indicators
2. Advanced animations
3. Mobile responsiveness optimization

---

## 4. Testing Checklist

### Timeline Chart
- [ ] Test with 1 professor (should show 1 line)
- [ ] Test with 5+ professors (all lines visible)
- [ ] Test filtering by professor (line updates correctly)
- [ ] Test date range filtering (line data updates)

### Heatmap
- [ ] Initial load displays chart (no tab switch needed)
- [ ] Small dataset (< 100 points) renders
- [ ] Large dataset (> 1000 points) renders without collapse
- [ ] Responsive on mobile/tablet
- [ ] Zoom/pan works if enabled

### Network Graph
- [ ] Nodes visible and not overlapping
- [ ] Edge weights displayed
- [ ] Nodes sized proportionally
- [ ] Force layout centers high-degree nodes
- [ ] Layout stable after animation

### Statistics
- [ ] Total counts displayed correctly
- [ ] Top-K lists show correct items
- [ ] Filtered counts update with filters
- [ ] All stat cards render properly
- [ ] Responsive layout on mobile

### Filters
- [ ] Professor filter shows only professors
- [ ] No students in professor list
- [ ] Filter list updates with data changes

---

## 5. Implementation Timeline

**Phase 1 (Critical Fixes):** 2-3 days
- Timeline chart fix
- Heatmap rendering fix
- Professor filter fix

**Phase 2 (Enhancements):** 3-4 days
- Network graph improvements
- Statistics enhancements
- New stat cards

**Phase 3 (Polish):** 1-2 days
- Testing and refinement
- Performance optimization
- Documentation updates

---

## 6. Notes

- Keep existing chart libraries/frameworks where possible
- Ensure backward compatibility with existing API endpoints
- Add appropriate error handling for edge cases
- Consider accessibility (labels, colors, keyboard navigation)
- Test with various data scenarios (empty, small, large datasets)
