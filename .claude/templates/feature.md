# Feature: Uploading xlsx documents to server

## 🎯 Objective
Allow new users to upload xlsx documents

### 🌐 CONTEXT
<BACKEND_CONTRACT>
```json
{
  "version": "1.0.0",
  "organization": "Engineering",
  "date": "February 2026",
  "abstract": "Automated changelog and version management for monorepo packages. Analyzes staged changes to determine affected packages, updates package.json versions, and appends formatted entries to CHANGE_LOG.md files without creating commits.",
}
```
</BACKEND_CONTRACT>
<REQ_UX>
1. Use Roche Design standards -> https://roche-design.com
</REQ_UX>
<VALIDATION_RULES>
1. Only xlsx file
2. Max size 10 MB
3. Only one allowed
</VALIDATION_RULES>
<DESIGN>
https://roche-design.com 
</DESIGN>

### 🎨 UI & UX
- Flow starts from "welcome screen" with title, description and button below
- After starting popup appears with option to select file
- Only xlsx files are displayed
- If error occurs (validation or other), display error as toast
- During upload show the progress with "line" and percentage below
- When upload if finished show success toast
- When file is picked show it's icon (xlsx and it's name on the ui) above the progress
- Must support mobile/tablets/desktop devices. When bigger than desktop - use max width container
- Allow to upload several files and display each upload as a table row with own progress
- Cancel of upload should be possible via "x" icon and button

### ✅ Acceptance Criteria
- [ ] Flow is validated via following <VALIDATION_RULES></VALIDATION_RULES>
- [ ] Flow is integrated with endpoints from <BACKEND_CONTRACT></BACKEND_CONTRACT> and follows <REQ_UX></REQ_UX> requirements
- [ ] The [🎨 UI & UX] guidelines are followed
- [ ] Multiple files may be uploaded and their upload is tracked with real time progress datatable
- [ ] UI looks pixel perfect according to provided designs <DESIGN></DESIGN>