
# ISO Connect - ISO Consultant Marketplace

A full-stack Next.js application that connects companies with verified ISO consultants for certification needs.

## Features

- **Role-based Authentication**: Company, Consultant, and Admin roles
- **Consultant Directory**: Public listing with search and filtering
- **Inquiry System**: Companies can send inquiries to consultants
- **Profile Management**: Consultants can manage their profiles and credentials
- **Admin Panel**: Manage consultant verification and monitor platform activity
- **Responsive Design**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for file uploads)

## Setup Instructions

### 1. Supabase Project Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Go to Settings → API to get your project URL and API keys

### 2. Database Setup

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the entire contents of `scripts/setup-database.sql` into the SQL editor
3. Run the script to create all tables, policies, and demo data

### 3. Environment Variables

Update the `.env` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Email configuration for notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
ADMIN_EMAIL=admin@isoconnect.com
```

### 4. Install Dependencies

```bash
yarn install
```

### 5. Run the Development Server

```bash
yarn dev
```

The application will be available at `http://localhost:3000`

## Demo Accounts

The setup script creates demo accounts for testing:

- **Admin**: admin@isoconnect.com / password123
- **Company**: john@doe.com / johndoe123  
- **Consultant**: sarah@example.com / password123
- **Consultant**: michael@example.com / password123

## User Flows

### For Companies
1. Sign up with company role
2. Browse verified consultants in the directory
3. Filter by ISO standards, industries, regions
4. Send inquiries to consultants
5. Track inquiry status in dashboard

### For Consultants
1. Sign up with consultant role and basic profile info
2. Complete profile with expertise, certifications, availability
3. Wait for admin verification
4. Receive and respond to client inquiries
5. Manage profile and business through dashboard

### For Admins
1. Monitor platform activity and user registrations
2. Verify consultant credentials and expertise
3. Track successful matches and platform metrics
4. Manage user accounts and resolve issues

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `GET /api/auth/callback` - Auth callback handler

### Consultants
- `GET /api/consultants` - List consultants with filters
- `GET /api/consultants/[id]` - Get consultant profile
- `PUT /api/consultants/[id]` - Update consultant profile

### Inquiries
- `POST /api/inquiries` - Create new inquiry
- `GET /api/inquiries` - List user's inquiries
- `PUT /api/inquiries/[id]` - Update inquiry status

### Admin
- `PUT /api/admin/consultants/[id]/verify` - Toggle consultant verification

## Database Schema

The application uses the following main tables:

- **users**: Core user information with role-based access
- **consultant_profiles**: Extended profile data for consultants
- **inquiries**: Communication between companies and consultants

See `scripts/setup-database.sql` for the complete schema.

## Security Features

- Row Level Security (RLS) policies on all tables
- Role-based access control throughout the application
- Secure authentication with Supabase Auth
- Protected API routes with user verification
- Input validation and sanitization

## Deployment

The application is ready for deployment on platforms like Vercel, Netlify, or any Node.js hosting service. Make sure to:

1. Set up environment variables in your hosting platform
2. Ensure your Supabase project is properly configured
3. Test all functionality in the production environment

## Support

For issues or questions about the application, please check the code comments and documentation within the source files.
