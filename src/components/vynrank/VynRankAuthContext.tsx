"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { VynRankNavKey } from "@/lib/vynrank/acl";
import type { VynRankRole } from "@/lib/vynrank/session";

export type VynRankUser = {
  id: string;
  name: string;
  email: string;
  role: VynRankRole;
  orgId: string;
  isActive: boolean;
};

type AuthState = {
  loading: boolean;
  authenticated: boolean;
  user: VynRankUser | null;
  roleLabel: string;
  navKeys: VynRankNavKey[];
  defaultPath: string;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function VynRankAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<VynRankUser | null>(null);
  const [roleLabel, setRoleLabel] = useState("");
  const [navKeys, setNavKeys] = useState<VynRankNavKey[]>([]);
  const [defaultPath, setDefaultPath] = useState("/vynrank");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/vynrank/auth", { cache: "no-store" });
      if (!res.ok) {
        setAuthenticated(false);
        setUser(null);
        setNavKeys([]);
        return;
      }
      const data = await res.json();
      setAuthenticated(Boolean(data.authenticated));
      setUser(data.user || null);
      setRoleLabel(String(data.roleLabel || ""));
      setNavKeys(Array.isArray(data.navKeys) ? data.navKeys : []);
      setDefaultPath(String(data.defaultPath || "/vynrank"));
    } catch {
      setAuthenticated(false);
      setUser(null);
      setNavKeys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/vynrank/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    }).catch(() => {});
    window.location.href = "/vynrank/login";
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      loading,
      authenticated,
      user,
      roleLabel,
      navKeys,
      defaultPath,
      refresh,
      logout,
    }),
    [loading, authenticated, user, roleLabel, navKeys, defaultPath, refresh, logout]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVynRankAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useVynRankAuth must be used within VynRankAuthProvider");
  return ctx;
}
