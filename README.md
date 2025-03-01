# Mini Collection Management System

## Overview

The **Mini Collection Management System** is a full-stack application designed to manage customer payments and notifications. It includes features like customer management, payment tracking, real-time notifications, and bulk customer uploads via Excel. The system is built using **Next.js** with the App Router, **TypeScript**, and **Elasticsearch** as the database. Real-time updates are handled using **Pusher**, and the UI is styled using **shadcn** with **TailwindCSS**.

---

## Features

### 1. **Authentication System**

- User registration and login functionality.
- **JWT-based authentication** for secure access.

### 2. **Customer Management**

- **CRUD operations** for customer details:
  - Name
  - Contact information
  - Outstanding payment amount
  - Payment due date
  - Payment status
- **Bulk customer upload** via Excel:
  - Template provided for upload.
  - Data validation before import.
  - Import success/error summary.
- **List view** with filtering and sorting options.

### 3. **Payment Management**

- Mock payment API endpoint.
- Mark payments as completed/pending.
- **Real-time payment status updates** using WebSocket.

### 4. **Notification System**

- **Real-time notifications** using WebSocket:
  - Payment received
  - Payment overdue
  - New customer added
- **Notification center** to view all notifications.

### 5. **API Documentation**

- **Swagger/OpenAPI** documentation for all API endpoints.

---

## Technologies Used

### Frontend

- **Next.js** (App Router)
- **TypeScript**
- **shadcn** for UI components
- **TailwindCSS** for styling
- **React Hook Form** with **Zod** for form validation
- **Axios** for API requests
- **Pusher** for real-time notifications

### Backend

- **Node.js** with **Next.js API routes**
- **Elasticsearch** for database
- **JWT** for authentication
- **Node-cron** for scheduling overdue payment checks (local testing)
- **Vercel** for production deployment

### Other Libraries

- **Swagger UI** for API documentation
- **Sonner** for toast notifications
- **Lucide React** for icons
- **XLSX** for Excel file handling

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Elasticsearch (local or cloud instance)
- Pusher account (for real-time notifications)

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/customer-management.git
   cd customer-management
   ```
