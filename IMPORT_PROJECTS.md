# Import Projects Feature

## Overview

The Import Projects feature allows administrators to bulk import projects into the system from a JSON file. This is useful for migrating data from other systems or doing batch project creation.

## Features

✅ **File Upload with Drag & Drop**
- Intuitive drag-and-drop interface
- Click-to-upload fallback
- File type validation (JSON only)
- File size validation (max 10MB)
- File preview before upload

✅ **Progress Tracking**
- Real-time upload progress bar
- Percentage display
- Animated loader during import

✅ **Result Reporting**
- Success/failure summary
- Detailed error messages
- Per-item error details
- Success and failure counts
- Visual indicators (green for success, yellow for partial, red for failures)

✅ **Error Handling**
- File validation errors
- Network error handling
- Invalid JSON detection
- Backend validation error display
- Helpful error messages

✅ **User Experience**
- Clear instructions
- Sample JSON format provided
- Ability to import another file after completion
- Loading states
- Disabled buttons during import
- Toast notifications

## API Endpoint

### POST /projects/import

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Form data with `file` field containing JSON file

**Response (200):**
```json
{
  "success": 10,
  "failed": 2,
  "errors": [
    "Project 3: Missing title",
    "Project 7: Invalid type"
  ]
}
```

**Error Response (400, 401, 403, 500):**
```json
{
  "message": "File is too large",
  "error": "INVALID_FILE"
}
```

## JSON File Format

### Required Structure

The file must be a JSON array of project objects:

```json
[
  {
    "title": "Project Title",
    "type": "Research",
    "subtypes": ["Investigation"],
    "description": "Optional description",
    "director": {
      "name": "John",
      "lastname": "Doe",
      "email": "john@example.com"
    },
    "codirectors": [],
    "collaborators": [],
    "students": [],
    "tags": ["AI", "ML"],
    "applicationDomain": "Machine Learning"
  }
]
```

### Field Descriptions

#### Required Fields
- **title** (string) - Project name
- **type** (string) - Project type (e.g., "Research", "Development")
- **director** (object) - Main project director
  - **name** (string) - First name
  - **lastname** (string) - Last name
  - **email** (string) - Email address

#### Optional Fields
- **description** (string) - Project description
- **subtypes** (array) - Project subtypes
- **codirectors** (array) - Co-directors (same structure as director)
- **collaborators** (array) - Collaborators (same structure as director)
- **students** (array) - Student participants
- **tags** (array) - Project tags
- **applicationDomain** (string) - Application domain name

## Usage

1. **Navigate to Import Page**
   - Go to `/import-data` route
   - Only accessible to authenticated admin users

2. **Upload File**
   - Click or drag-and-drop JSON file
   - File validates automatically

3. **Start Import**
   - Click "Import Projects" button
   - Progress bar shows upload progress
   - Wait for completion

4. **Review Results**
   - See success/failure summary
   - Review any error messages
   - Option to import another file

## Component Structure

### ImportDataPage Component

**Location:** `src/pages/ImportDataPage.tsx`

**State:**
```typescript
interface ImportResult {
  success: number
  failed: number
  errors?: string[]
}

interface ImportProgress {
  isImporting: boolean
  progress: number
  result: ImportResult | null
}
```

**Functions:**
- `handleFileSelect()` - Validates and stores selected file
- `handleImport()` - Sends file to backend
- `handleReset()` - Clears state for another import

## API Function

### importProjects()

**Location:** `src/api/import.ts`

```typescript
import { importProjects } from '@/api/import'

const result = await importProjects(file)
// Returns: { success: 10, failed: 0 }
```

## Validation

### Frontend Validation
- ✓ File must be JSON (.json extension or application/json MIME type)
- ✓ File size must be ≤ 10MB
- ✓ File must be selected before import

### Backend Validation
- ✓ Valid JSON syntax
- ✓ Array of project objects
- ✓ Required fields present
- ✓ Field types correct
- ✓ Email format valid
- ✓ No duplicate titles per import
- ✓ Referenced directors exist or will be created

## Error Handling

### Frontend Errors
- Missing file
- Invalid file type
- File too large
- Network errors

### Backend Errors
- Invalid JSON
- Missing required fields
- Invalid field types
- Email validation
- Database constraint violations
- Insufficient permissions (403)
- Server errors (500)

## Example Usage

### Simple Import
```json
[
  {
    "title": "Machine Learning Research",
    "type": "Research",
    "subtypes": ["Investigation"],
    "director": {
      "name": "Jane",
      "lastname": "Smith",
      "email": "jane@university.edu"
    }
  }
]
```

### Complex Import with Multiple Participants
```json
[
  {
    "title": "Web Development Bootcamp",
    "type": "Development",
    "subtypes": ["Extension"],
    "description": "Full-stack web development course",
    "director": {
      "name": "John",
      "lastname": "Developer",
      "email": "john.dev@university.edu"
    },
    "codirectors": [
      {
        "name": "Sarah",
        "lastname": "Designer",
        "email": "sarah.design@university.edu"
      }
    ],
    "collaborators": [
      {
        "name": "Mike",
        "lastname": "DevOps",
        "email": "mike.devops@university.edu"
      }
    ],
    "students": [
      {
        "name": "Alex",
        "lastname": "Student",
        "email": "alex.student@university.edu"
      }
    ],
    "tags": ["Web", "Full-Stack", "JavaScript", "React"],
    "applicationDomain": "Software Development"
  }
]
```

## Progress Flow

1. **Initial State**
   - File upload area visible
   - Instructions displayed
   - Sample format shown

2. **Uploading**
   - Progress bar starts
   - Upload button disabled
   - Animated loader
   - Percentage display updates

3. **Processing**
   - Server processes projects
   - Database transactions
   - Error collection

4. **Results**
   - Success alert if all pass
   - Warning alert if some fail
   - Error list displayed
   - Summary statistics shown
   - "Import Another" button available

## Best Practices

✅ **Do:**
- Validate JSON locally before uploading
- Use the sample format as template
- Ensure all emails are unique
- Include director information
- Test with small file first

❌ **Don't:**
- Upload invalid JSON
- Include very large files
- Use special characters in titles
- Omit required fields
- Upload corrupted files

## Limitations

- Maximum file size: 10MB
- Maximum projects per import: 10,000 (backend limit)
- No selective import (all-or-nothing approach)
- No duplicate handling (fails on duplicates)
- Cannot update existing projects

## Future Enhancements

- [ ] Selective import (choose which projects to import)
- [ ] Dry-run preview before actual import
- [ ] CSV file support
- [ ] Update existing projects mode
- [ ] Batch re-import with failure recovery
- [ ] Export projects to JSON
- [ ] Import history/audit log
- [ ] Template generator

## Troubleshooting

### "File size must be less than 10MB"
- File is too large
- Solution: Split into smaller JSON files

### "Please select a valid JSON file"
- File is not JSON
- Solution: Save file as .json or ensure correct MIME type

### "Import failed. Please try again"
- Backend error
- Solution: Check error details, verify JSON format

### "Imported X projects, Y failed"
- Some projects had errors
- Solution: Check error list and fix issues

### 401 Error
- Not authenticated
- Solution: Login and try again

### 403 Error
- Not authorized to import
- Solution: Admin role required

## Support

For import issues or feature requests, refer to the error messages displayed or contact support with:
- Error message text
- Number of projects
- Sample of JSON content (without sensitive data)
