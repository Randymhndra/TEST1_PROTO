# Java Connection – Production Management System

A full production management platform designed for manufacturing and export workflow tracking.  
This system manages **orders**, **projects**, **workstations**, and includes a full **Decision Support System (DSS)** with volume analysis and process monitoring.

## Features

### Dashboard
- Live KPIs
- Order and project statistics
- Completion rates
- Bottleneck and risk detection

### Orders Management
- Create, update, and delete orders
- Packaging dimensions & auto cubic calculation
- Real-time status and progress tracking
- Auto-generated order IDs (ORD-00001)

### Project Management
- Manage projects and assign orders
- View project progress, risks, and cubic volume
- Auto-generated project IDs (PROJ-0001)
- Detailed per-order breakdown

### Production Tracking
- Workstation-level tracking
- Quantity completed, defects, time logs
- Issues and PIC tracking

### DSS Analysis
- Single Order Analysis
- Project Analysis (with workstation totals and cubic volume)
- Combined Factory Analysis
- Export to XLSX

## Tech Stack

**Frontend:** HTML5, CSS3, JavaScript, Chart.js  
**Backend:** Vercel Serverless Functions, MongoDB Atlas, Mongoose  
**Deployment:** Vercel

## Project Structure

```
index.html
styles.css
script.js
vercel.js
vercel.json
api/index.js
package.json
readme.md
```

## API Overview

### GET
- `/api?type=orders`
- `/api?type=projects`

### POST
- Create/update orders or projects

### DELETE
- Delete order by ID

## Database Schema

### Order
Includes:
- customer_name
- quantity
- product_description
- packaging dimensions
- progress
- risk
- tracking per workstation

### Project
Includes:
- project name, manager, description
- dates
- status
- notes
- assigned orders

## Running Locally

```
npm install
npm run dev
```

Create `.env`:

```
MONGODB_URI=your_connection_string
```

## Deployment

```
npm run deploy
```

Deploys to Vercel using `vercel.json`.

## Volume Calculation

```
volume_m3 = (L × W × H) / 1,000,000
```

Used in DSS, exports, and project analysis.

## License

Internal project – no public license.
