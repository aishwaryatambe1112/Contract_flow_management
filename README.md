# ContractFlow - Contract Management Platform

A professional contract management platform built with React, TypeScript, and Supabase. This application demonstrates clean architecture, state management, and modern UI design principles.

## Features

### 1. Blueprint Management
- Create reusable contract templates (blueprints)
- Configure multiple field types: Text, Date, Signature, Checkbox
- Position fields with X/Y coordinates
- Edit and delete existing blueprints
- View all blueprints in a centralized list

### 2. Contract Creation
- Generate contracts from existing blueprints
- Inherit all fields from the selected blueprint
- Fill in field values during contract creation
- Support for different input types based on field configuration

### 3. Contract Lifecycle Management
Complete lifecycle flow with controlled state transitions:
- **Created** → Initial state after contract creation
- **Approved** → Contract has been reviewed and approved
- **Sent** → Contract has been sent to relevant parties
- **Signed** → Contract has been signed
- **Locked** → Final state, contract cannot be edited
- **Revoked** → Contract has been cancelled (can occur after creation or sending)

Rules:
- State transitions are controlled (no skipping steps)
- Locked contracts are read-only
- Revoked contracts cannot proceed further
- Clear UI indication of current status and available actions

### 4. Dashboard
- View all contracts in a table format
- Filter by status categories:
  - **All**: All contracts
  - **Active**: Created and Approved contracts
  - **Pending**: Sent contracts awaiting signature
  - **Signed**: Signed and Locked contracts
- Display contract name, blueprint name, status, and creation date
- Quick action buttons to view and manage contracts

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe code
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Supabase** - PostgreSQL database with real-time capabilities
- **Supabase Client** - Type-safe database access

### UI Components
- Custom component library built from scratch
- Reusable components: Button, Input, Select, Modal, Badge
- Consistent design system with proper spacing and colors

## Architecture & Design Decisions

### State Management
- **React Context API** - Application-level state management
- Simple and effective for this application's scope
- Manages current view, selected blueprint/contract IDs
- No external state management library needed

### Component Structure
```
src/
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   └── Badge.tsx
│   ├── blueprints/       # Blueprint-related components
│   │   ├── BlueprintList.tsx
│   │   └── BlueprintForm.tsx
│   ├── contracts/        # Contract-related components
│   │   ├── ContractCreate.tsx
│   │   ├── ContractView.tsx
│   │   └── ContractStatusManager.tsx
│   ├── Dashboard.tsx     # Main dashboard
│   └── Layout.tsx        # App layout with navigation
├── context/
│   └── AppContext.tsx    # Application state context
├── lib/
│   └── supabase.ts       # Supabase client configuration
├── types/
│   └── index.ts          # TypeScript type definitions
├── App.tsx               # Main app component with routing
└── main.tsx              # Entry point
```

### Database Schema

**blueprints**
- Stores contract template definitions
- Fields: id, name, description, created_at, updated_at

**blueprint_fields**
- Stores field configurations for each blueprint
- Fields: id, blueprint_id, field_type, label, position_x, position_y, created_at
- Supports: text, date, signature, checkbox field types

**contracts**
- Stores contract instances
- Fields: id, name, blueprint_id, status, created_at, updated_at
- Status field enforced with CHECK constraint

**contract_field_values**
- Stores values for each field in a contract
- Fields: id, contract_id, blueprint_field_id, value, created_at, updated_at
- Unique constraint on (contract_id, blueprint_field_id)

### Routing
- Client-side routing using React Context
- View-based navigation without URL changes
- Simple and effective for single-page application

### Styling Approach
- Tailwind CSS for rapid development
- Custom color palette focusing on blues and neutrals
- Consistent spacing using Tailwind's spacing scale
- Responsive design with mobile-first approach
- Clean, professional aesthetic suitable for business applications

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd contract-management-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - The database schema is automatically applied via migrations
   - Copy your project URL and anon key

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:5173`
   - The application is ready to use!

### Building for Production

```bash
npm run build
npm run preview
```

## Usage Guide

### Creating a Blueprint
1. Navigate to "Blueprints" in the navigation
2. Click "Create Blueprint"
3. Enter blueprint name and description
4. Add fields by clicking "Add Field"
5. Configure each field:
   - Enter a label (e.g., "Employee Name")
   - Select field type (Text, Date, Signature, Checkbox)
   - Set position coordinates (X, Y)
6. Click "Create Blueprint"

### Creating a Contract
1. Navigate to "Dashboard"
2. Click "Create Contract"
3. Enter contract name
4. Select a blueprint from the dropdown
5. Fill in values for all fields
6. Click "Create Contract"

### Managing Contract Status
1. Open a contract from the dashboard
2. Click the status badge dropdown
3. Select the next status in the workflow
4. Confirm the status change
5. Note: Status transitions are controlled and cannot be skipped

### Viewing and Editing Contracts
1. From the dashboard, click "View" on any contract
2. Edit field values (if not locked/revoked)
3. Click "Save Changes" to persist updates
4. Locked and revoked contracts are read-only

## Assumptions and Limitations

### Assumptions
- Single-user application (no authentication required for demo)
- All users have full access to all blueprints and contracts
- Field positioning is numerical (X, Y coordinates) rather than drag-and-drop
- Contracts can be edited before being locked
- The signature field accepts typed text (no actual signature drawing)

### Limitations
- No user authentication or authorization
- No real-time collaboration features
- Field positioning is manual (numeric input) rather than visual
- No PDF generation or export functionality
- No email notifications for status changes
- No audit log of changes
- No search functionality for contracts or blueprints
- Basic validation (can be enhanced further)

### Future Enhancements
- Drag-and-drop field placement on visual canvas
- PDF generation and download
- Document version history
- Advanced search and filtering
- User authentication and role-based access control
- Email notifications for lifecycle events
- Document templates with pre-filled content
- Bulk operations on contracts
- Analytics dashboard with insights
- API for integrations

## Development

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Consistent code formatting
- Component-based architecture
- Proper error handling
- Clean separation of concerns

### Testing
Currently no automated tests are implemented. Recommended additions:
- Unit tests for utility functions
- Component tests with React Testing Library
- Integration tests for critical workflows
- E2E tests with Playwright or Cypress

## License

This project is created as an assignment submission.

## Contact

For questions or feedback about this project, please refer to the submission form.