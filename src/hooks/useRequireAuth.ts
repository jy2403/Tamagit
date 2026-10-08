import { useAuth } from '@/context/AuthContext';

export type AuthGateStatus = 'loading' | 'anonymous' | 'forbidden' | 'ready';

type UseRequireAuthOptions = {
  admin?: boolean;
  extraLoading?: boolean;
};

export function useRequireAuth({
  admin = false,
  extraLoading = false,
}: UseRequireAuthOptions = {}): AuthGateStatus {
  const { token, user, isLoading } = useAuth();

  if (isLoading || extraLoading) return 'loading';
  if (!token) return 'anonymous';
  if (admin && !user?.isAdmin) return 'forbidden';
  return 'ready';
}
