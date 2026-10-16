# CampusLost – College Lost & Found Platform

A front-end web app where students report lost items and post found items so they can be matched with their owners.

**Tech stack:** HTML, CSS, JavaScript (no frameworks, no backend)

## Features
- Keyword search across item name, category, location and description
- Category, status (Lost / Found / Returned) filters and date sorting
- Report form with validation: name, category, location, date, description, contact
- Dynamic item listings with status updates (mark recovered/returned, reopen) and delete
- Live counters for lost, found and returned items
- Data persisted in the browser with LocalStorage
- Responsive layout with automatic dark mode

## Run locally
Open `index.html` in any modern browser. No build step or install needed.

## Project structure
```
CampusLost/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Possible improvements
- Edit existing posts
- Image upload for items
- Backend (Node/Firebase) so posts are shared across users
