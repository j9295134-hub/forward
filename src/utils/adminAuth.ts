export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface AdminSession {
  token: string;
  admin: AdminUser;
}

export const ADMIN_AUTH_EVENT = 'admin-auth-changed';

const STORAGE_KEY = 'adminSession';

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const emitAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
  }
};

export const getStoredAdminSession = (): AdminSession | null => {
  if (!canUseStorage()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!parsed?.token || !parsed?.admin?.id || !parsed?.admin?.email) {
      return null;
    }

    return {
      token: String(parsed.token),
      admin: {
        id: String(parsed.admin.id),
        email: String(parsed.admin.email),
        name: String(parsed.admin.name ?? 'Admin'),
      },
    };
  } catch {
    return null;
  }
};

export const getAdminToken = (): string => getStoredAdminSession()?.token || '';

export const setStoredAdminSession = (session: AdminSession) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.localStorage.removeItem('adminAuth');
  emitAuthChange();
};

export const clearStoredAdminSession = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem('adminAuth');
  emitAuthChange();
};
