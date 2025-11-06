# API Setup Documentation

This document describes the API setup with JWT authentication, PostgreSQL database using Prisma ORM, React Query, and React Hook Form with Zod validation.

## Overview

The application now uses:
- **JWT-based authentication** with access and refresh tokens
- **PostgreSQL database** with Prisma ORM
- **React Query** for data fetching and state management
- **React Hook Form** with **Zod** for form validation

## Database Setup

### Prisma Schema

The Prisma schema (`prisma/schema.prisma`) includes models for:
- `User` - Authentication and user management
- `Client` - Client information
- `Invoice` - Invoice records
- `InvoiceLineItem` - Invoice line items
- `Proposal` - Proposals
- `Agreement` - Service agreements
- `Expense` - Expense tracking
- `ExpenseCategory` - Expense categories
- `Document` - Document management

### Environment Variables

Create a `.env` file in the root directory with:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/peper_bot_erp?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
NODE_ENV="development"
```

### Database Migration

To set up the database:

```bash
# Generate Prisma Client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

## API Routes

### Authentication Routes

All authentication routes are in `/api/auth/`:

1. **POST `/api/auth/login`** - User login
   - Body: `{ email: string, password: string }`
   - Returns: `{ success: boolean, user: User, accessToken: string, refreshToken: string }`
   - Sets HTTP-only cookies for tokens

2. **POST `/api/auth/register`** - User registration
   - Body: `{ email: string, password: string, name: string, role?: 'ADMIN' | 'CLIENT' }`
   - Returns: `{ success: boolean, user: User, accessToken: string, refreshToken: string }`
   - Sets HTTP-only cookies for tokens

3. **POST `/api/auth/refresh`** - Refresh access token
   - Uses refresh token from cookie
   - Returns: `{ success: boolean, user: User, accessToken: string }`
   - Updates access token cookie

4. **POST `/api/auth/logout`** - User logout
   - Clears refresh token from database
   - Clears HTTP-only cookies

5. **GET `/api/auth/me`** - Get current user
   - Uses access token from cookie
   - Returns: `{ success: boolean, user: User }`

## React Query Hooks

### Authentication Hooks (`src/hooks/useAuth.ts`)

- `useLogin()` - Login mutation
- `useRegister()` - Registration mutation
- `useLogout()` - Logout mutation
- `useRefreshToken()` - Token refresh mutation
- `useCurrentUser()` - Get current user query

### Usage Example

```typescript
import { useLogin } from '@/hooks/useAuth';

function LoginForm() {
  const loginMutation = useLogin();

  const handleLogin = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
}
```

## Form Validation

### Zod Schemas (`src/lib/validations/auth.ts`)

- `loginSchema` - Login form validation
- `registerSchema` - Registration form validation (includes password confirmation)

### React Hook Form Integration

Example usage in login form:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});

const onSubmit = (data: LoginFormData) => {
  // Handle form submission
};
```

## AuthContext

The `AuthContext` (`src/contexts/AuthContext.tsx`) has been updated to:
- Use React Query hooks instead of mock data
- Automatically refresh tokens before expiry
- Provide loading and error states
- Integrate with the API

### Usage

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated, isLoading } = useAuth();
  
  // Use authentication state
}
```

## File Structure

```
src/
├── app/
│   └── api/
│       └── auth/
│           ├── login/route.ts
│           ├── register/route.ts
│           ├── refresh/route.ts
│           ├── logout/route.ts
│           └── me/route.ts
├── lib/
│   ├── prisma.ts          # Prisma client
│   ├── jwt.ts             # JWT utilities
│   ├── auth.ts            # Authentication utilities
│   └── validations/
│       └── auth.ts        # Zod schemas
├── hooks/
│   └── useAuth.ts         # React Query hooks
├── contexts/
│   └── AuthContext.tsx    # Updated to use API
└── providers/
    └── QueryProvider.tsx  # React Query provider
```

## Next Steps

1. Set up your PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Test authentication endpoints
5. Update other forms to use React Hook Form + Zod
6. Create additional API routes for other resources (clients, invoices, etc.)

## Security Notes

- JWT secrets should be strong and unique in production
- Use HTTPS in production
- HTTP-only cookies prevent XSS attacks
- Refresh tokens are stored in the database and can be revoked
- Passwords are hashed using bcrypt

