# Mini ERP System with B2B Marketplace

A comprehensive Mini Enterprise Resource Planning (ERP) system designed for small shops with an integrated B2B marketplace component.

## Features

### Shop Owner Features
- Dashboard with key performance indicators
- Inventory management
- Customer relationship management
- Order processing and tracking
- Invoice generation and management
- Marketplace shopping (B2B)

### Vendor Features
- Product management
- Marketplace listings
- Order fulfillment
- Sales reporting

## Tech Stack

- **Frontend**: React.js, TanStack Query, Tailwind CSS, shadcn UI
- **Backend**: Node.js, Express.js
- **Authentication**: Passport.js with local strategy
- **Database**: In-memory storage (can be connected to PostgreSQL)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/BizBear24/mini-erp-system.git
cd mini-erp-system
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

### Default Login Credentials

**Shop Owner:**
- Username: shopowner
- Password: password123

**Vendor:**
- Username: vendor1
- Password: password123

## License

This project is licensed under the MIT License - see the LICENSE file for details.