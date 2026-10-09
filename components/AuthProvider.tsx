"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { userStore, type Address, type AuthProvider as Provider, type UserProfile } from "@/lib/auth";

const addrId = () => "addr-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const blankProfile = (input: { name: string; email: string; provider: Provider }): UserProfile => ({
  loggedIn: true,
  provider: input.provider,
  name: input.name,
  email: input.email,
  phone: "",
  addresses: [],
  preferredCategories: [],
  excludedAllergens: [],
});

interface AuthContextValue {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (input: { name: string; email: string; provider: Provider }) => void;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<UserProfile, "name" | "email" | "phone">>) => void;
  addAddress: (input: Omit<Address, "id">) => void;
  updateAddress: (id: string, patch: Partial<Omit<Address, "id">>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  setPreferences: (patch: { preferredCategories?: string[]; excludedAllergens?: string[] }) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(userStore.subscribe, userStore.getSnapshot, userStore.getServerSnapshot);

  const login = useCallback((input: { name: string; email: string; provider: Provider }) => {
    const current = userStore.getSnapshot();
    userStore.set(
      current
        ? { ...current, loggedIn: true, name: input.name, email: input.email, provider: input.provider }
        : blankProfile(input),
    );
  }, []);

  const logout = useCallback(() => {
    const current = userStore.getSnapshot();
    if (current) userStore.set({ ...current, loggedIn: false });
  }, []);

  const updateProfile = useCallback((patch: Partial<Pick<UserProfile, "name" | "email" | "phone">>) => {
    const current = userStore.getSnapshot();
    if (current) userStore.set({ ...current, ...patch });
  }, []);

  const addAddress = useCallback((input: Omit<Address, "id">) => {
    const current = userStore.getSnapshot();
    if (!current) return;
    const next: Address = { ...input, id: addrId() };
    const addresses = next.isDefault
      ? [...current.addresses.map((a) => ({ ...a, isDefault: false })), next]
      : [...current.addresses, next];
    userStore.set({ ...current, addresses });
  }, []);

  const updateAddress = useCallback((id: string, patch: Partial<Omit<Address, "id">>) => {
    const current = userStore.getSnapshot();
    if (!current) return;
    const makesDefault = patch.isDefault === true;
    userStore.set({
      ...current,
      addresses: current.addresses.map((a) =>
        a.id === id
          ? { ...a, ...patch }
          : makesDefault
            ? { ...a, isDefault: false }
            : a,
      ),
    });
  }, []);

  const removeAddress = useCallback((id: string) => {
    const current = userStore.getSnapshot();
    if (!current) return;
    userStore.set({ ...current, addresses: current.addresses.filter((a) => a.id !== id) });
  }, []);

  const setDefaultAddress = useCallback((id: string) => {
    const current = userStore.getSnapshot();
    if (!current) return;
    userStore.set({
      ...current,
      addresses: current.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
    });
  }, []);

  const setPreferences = useCallback(
    (patch: { preferredCategories?: string[]; excludedAllergens?: string[] }) => {
      const current = userStore.getSnapshot();
      if (current) userStore.set({ ...current, ...patch });
    },
    [],
  );

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user?.loggedIn,
      login,
      logout,
      updateProfile,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      setPreferences,
    }),
    [user, login, logout, updateProfile, addAddress, updateAddress, removeAddress, setDefaultAddress, setPreferences],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
