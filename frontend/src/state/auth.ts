import { atom, useAtom } from 'jotai';
import { api, setAuthTokens } from '../api/client';

export type Role = 'requester' | 'hod' | 'pm' | 'store' | 'admin';

export interface AuthUser {
  id: number;
  name: string;
  role: Role;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
};

const authAtom = atom<AuthState>(initialState);

export function useAuth() {
  const [state, setState] = useAtom(authAtom);

  function persist(stateToPersist: AuthState) {
    localStorage.setItem('mrms_auth', JSON.stringify(stateToPersist));
  }

  function restore() {
    const raw = localStorage.getItem('mrms_auth');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as AuthState;
      setState(parsed);
      if (parsed.accessToken && parsed.refreshToken) {
        setAuthTokens({ accessToken: parsed.accessToken, refreshToken: parsed.refreshToken });
      }
    } catch {
      // ignore
    }
  }

  async function login(username: string, password: string) {
    const resp = await api.post('/auth/login', { username, password });
    const { accessToken, refreshToken, user } = resp.data as any;
    const next: AuthState = { user, accessToken, refreshToken };
    setState(next);
    setAuthTokens({ accessToken, refreshToken });
    persist(next);
    return user as AuthUser;
  }

  function logout() {
    const cleared: AuthState = { user: null, accessToken: null, refreshToken: null };
    setState(cleared);
    setAuthTokens(null);
    localStorage.removeItem('mrms_auth');
  }

  return { ...state, login, logout, restore };
}
