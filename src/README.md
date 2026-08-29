

## V10 layout fix
- Header and sidebar are independently viewport-fixed.
- Sidebar has no header offset in its positioning.
- Only sidebar navigation scrolls.
- Sidebar footer remains stationary.
- Main page scroll is independent.
- Mobile sidebar is a viewport drawer.


## V11 component surface system
- Explicit page/card/control/input surface tokens
- Light workspace surfaces remain distinct from dark navigation
- Inputs, textareas and selects have visible borders and focus states
- Primary/secondary/icon controls have consistent contrast
- Result tables, code panels and status states have dedicated surfaces
- Dark mode uses its own intentional surfaces rather than inherited black backgrounds


## Phase 9 — Professional Developer Workbenches

Added professional browser-first tools:
- JSON Diff
- Regex Workbench
- Hash Generator
- cURL Builder

These use local browser processing where practical and share the locked DevBox workbench interaction model.


## Phase 10 — HTTP Client

Added a browser-first HTTP Client workbench:
- HTTP methods and URL builder
- Query parameters
- Request headers
- Bearer and Basic authorization
- JSON/raw request body
- Generated cURL
- Response status, timing and size
- Response body JSON formatting
- Response headers
- Recent request history
- CORS-aware error messaging
