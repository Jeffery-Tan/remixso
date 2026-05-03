"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserProfile, CreditInfo } from "@/types/user";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  credits: CreditInfo | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  credits: null,
  isLoading: true,
  signOut: async () => {},
  refreshCredits: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [credits, setCredits] = useState<CreditInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async (userId: string) => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          avatarUrl: data.avatar_url,
        });
      }
    } catch {
      // 新用户可能还没有 profile 行，静默降级
      setProfile(null);
    }
  };

  const fetchCredits = async () => {
    try {
      const res = await fetch("/api/user/credits");
      if (res.ok) {
        const data = await res.json();
        setCredits(data);
      }
    } catch {
      // 网络错误静默降级，UI 通过 credits === null 判断
    }
  };

  useEffect(() => {
    const supabase = createClient();

    // 获取初始 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchCredits();
      }
      setIsLoading(false);
    });

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchCredits();
      } else {
        setProfile(null);
        setCredits(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCredits(null);
    router.push("/");
  }, [router]);

  const refreshCredits = useCallback(async () => {
    await fetchCredits();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, credits, isLoading, signOut, refreshCredits }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
