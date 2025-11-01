# Import Projects Feature

## Overview

The Import Projects feature allows administrators to bulk import projects from a CSV file. The workflow is:
1. Upload CSV file
2. Backend parses and enriches the data (creates participants, validates data)
3. Frontend displays results in an editable table
4. User can edit individual rows, remove failed projects, or remove all
5. Apply to save to database

## Features

✅ **CSV File Upload**
- Drag-and-drop interface
- Click-to-upload option
- File type validation (.csv only)
- File size validation (max 50MB)

✅ **CSV Parsing**
- Backend parses CSV and enriches data
- Creates or links participants automatically
- Returns success/error status per row
- Handles missing or invalid data

✅ **Editable Results Table**
- Display parsed projects in plain table
- Inline editing of any field
- Save/cancel per row
- Delete individual rows

✅ **Batch Actions**
- Remove all failed projects
- Remove all data
- Apply successful projects to database
- Real-time row count updates

✅ **Error Handling**
- Per-row error messages
- Clear failure indication
- Helpful validation messages

## CSV File Format

The expected CSV format (based on dataset.csv):

```
Tipo de proyecto,Fecha Consejo,Fecha Finalizacion,Completado,Titulo,Director,Co-Director,Colaborador,Alumno 1,Alumno 2,Alumno 3,Tema(s),Area o Dominio de Aplicacion
PF,14/06/2011,14/09/2011,TRUE,Project Title,Director Name,Co-Director Name,Collaborator Name,Student 1,Student 2,Student 3,Topics,Application Domain
```

### Column Mapping

| CSV Column | Import Field | Required |
|-----------|--------------|----------|
| Tipo de proyecto | type | Yes |
| Titulo | title | Yes |
| Director | director | Yes |
| Co-Director | codirectors | No |
| Colaborador | collaborators | No |
| Alumno 1-3 | students | No |
| Tema(s) | tags | No |
| Area o Dominio de Aplicacion | applicationDomain | No |

## API Endpoints

### POST /projects/parse-csv

**Request:**
- Content-Type: multipart/form-data
- Body: Form data with 'file' field containing CSV file

**Response (200):**
```json
{
  "projects": [
    {
      "id": "uuid-123",
      "title": "Project Title",
      "type": "PF",
      "director": "SMITH, John",
      "codirectors": "JONES, Jane",
      "collaborators": "DOE, Bob",
      "students": "Student 1; Student 2",
      "tags": "AI, ML",
      "applicationDomain": "Machine Learning",
      "status": "success"
    },
    {
      "id": "uuid-124",
      "title": "Bad Project",
      "type": "INVALID",
      "director": "UNKNOWN, Author",
      "codirectors": "",
      "collaborators": "",
      "students": "",
      "tags": "",
      "applicationDomain": "",
      "status": "error",
      "error": "Invalid project type: INVALID"
    }
  ],
  "totalProcessed": 2,
  "successCount": 1,
  "errorCount": 1
}
```

### POST /projects/import

**Request:**
```json
{
  "projects": [
    {
      "id": "uuid-123",
      "title": "Project Title",
      "type": "PF",
      "director": "SMITH, John",
      "codirectors": "JONES, Jane",
      "collaborators": "DOE, Bob",
      "students": "Student 1; Student 2",
      "tags": "AI, ML",
      "applicationDomain": "Machine Learning",
      "status": "success"
    }
  ]
}
```

**Response (200):**
- Empty response on success

## UI Workflow

### Step 1: Upload
- Display drag-and-drop area
- Accept .csv files
- Max 50MB

### Step 2: Parse
- User clicks "Parse CSV"
- Shows loading state
- Calls /projects/parse-csv

### Step 3: Review
- Display summary stats (success, failed, total)
- Show results in editable table
- Columns: Status, Title, Type, Director, Students, Actions
- Each row has Edit/Delete actions

### Step 4: Edit (Optional)
- User clicks "Edit" on any row
- Inline editing for fields
- Save or Cancel
- Updates state immediately

### Step 5: Cleanup (Optional)
- Remove individual rows
- Remove all failed projects
- Remove all data

### Step 6: Apply
- User clicks "Apply X Projects"
- Calls /projects/import with successful projects only
- Shows success message
- Clears all data

## Component Structure

**ImportDataPage**
- File upload state
- Parse result state
- Editing state
- Loading state

**Functions:**
- `handleFileSelect()` - Validates and stores CSV file
- `handleParse()` - Calls parse-csv endpoint
- `handleEdit()` - Enters edit mode for row
- `handleSaveEdit()` - Saves row changes
- `handleDeleteRow()` - Removes single row
- `handleRemoveAllErrors()` - Removes all failed rows
- `handleRemoveAll()` - Clears all data
- `handleApply()` - Applies to database

## Data Flow

```
User uploads CSV
    ↓
Frontend validates file
    ↓
Send to /projects/parse-csv
    ↓
Backend enriches data (creates participants, validates)
    ↓
Returns projects with success/error status
    ↓
Display in editable table
    ↓
User can edit, remove, or remove all
    ↓
User clicks Apply
    ↓
Send to /projects/import
    ↓
Saved to database
    ↓
Show success message
```

## Error Handling

### Parse Errors
- Invalid CSV format → "Parse failed..."
- Missing required columns → Per-row error message
- Invalid data types → Per-row error message
- File too large → "File size must be less than 50MB"
- Wrong file type → "Please select a valid CSV file"

### Apply Errors
- Network errors → "Apply failed..."
- Validation errors → Toast message
- Permission errors → 403 error

## Best Practices

✅ **Do:**
- Validate CSV file locally before uploading
- Review all rows before applying
- Remove obviously bad rows
- Edit participant names if needed
- Test with small CSV first

❌ **Don't:**
- Upload very large files
- Skip reviewing errors
- Apply without checking results
- Expect all data to be perfect

## Limitations

- Max file size: 50MB
- CSV format must match expected structure
- No selective import (must remove unwanted rows)
- Backend validates all data
- Cannot update existing projects (overwrites)

## Future Enhancements

- [ ] Column mapping UI (allow flexible CSV format)
- [ ] Bulk edit multiple rows
- [ ] Export parsed results
- [ ] Preview before parse
- [ ] Auto-match participant names
- [ ] Dry-run option
- [ ] Import history/audit log

## Support

For CSV import issues, refer to:
- Error messages in table (per-row errors)
- Backend logs for validation errors
- Dataset.csv for format example

