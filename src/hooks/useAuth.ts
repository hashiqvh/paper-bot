import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'CLIENT';
}

interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    twoFactorEnabled?: boolean;
  };
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  return data;
}

async function registerUser(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Registration failed');
  }

  return result;
}

async function logoutUser(): Promise<{ success: boolean }> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Logout failed');
  }

  return data;
}

async function refreshToken(): Promise<AuthResponse> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Token refresh failed');
  }

  return data;
}

async function getCurrentUser(): Promise<AuthResponse> {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to get user');
  }

  return data;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
    },
  });
}

export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshToken,
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData(['user'], data.user);
      }
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

