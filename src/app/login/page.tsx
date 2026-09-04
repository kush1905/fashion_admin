"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { DEMO_STAFF, DEMO_SUPER_ADMIN } from "@/lib/demo-auth";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const LOGIN_ART = {
  hero: "https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1600",
  insetA: "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800",
  insetB: "https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=800",
};

export default function LoginPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const login = useAuthStore((s) => s.login);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) setHydrated();
    return useAuthStore.persist.onFinishHydration(() => setHydrated());
  }, [setHydrated]);

  useEffect(() => {
    if (hydrated && user) router.replace("/admin");
  }, [hydrated, user, router]);

  const selected =
    identifier === DEMO_SUPER_ADMIN.staffId || identifier.toLowerCase() === DEMO_SUPER_ADMIN.email
      ? "admin"
      : identifier === DEMO_STAFF.staffId || identifier.toLowerCase() === DEMO_STAFF.email
        ? "staff"
        : null;

  function fill(kind: "admin" | "staff") {
    const account = kind === "admin" ? DEMO_SUPER_ADMIN : DEMO_STAFF;
    setIdentifier(account.staffId);
    setPassword(account.password);
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Enter a demo staff ID or email, and the password.");
      return;
    }
    setBusy(true);
    setError("");
    const result = await login(identifier, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(`Welcome back, ${result.user.name}`);
    router.replace("/admin");
  }

  return (
    <div className="min-h-dvh bg-[#14110f] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(min(100%,440px),1fr)]">
      <aside className="relative isolate h-[30vh] overflow-hidden sm:h-[38vh] lg:h-dvh">
        <img
          src={LOGIN_ART.hero}
          alt="Couture gown, lookbook still"
          className="absolute inset-0 size-full object-cover object-[center_18%] lg:object-[center_22%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,17,15,0.18)_0%,rgba(20,17,15,0.12)_38%,rgba(20,17,15,0.78)_100%)]" />
        <div className="login-grain pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay" />

        <div className="relative z-10 flex h-full flex-col justify-between p-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:p-10">
          <div className="flex items-center gap-3 text-[#f6f1ea]">
            <div className="flex size-10 items-center justify-center rounded-md bg-[#c4a574] text-sm font-medium text-[#1c1917]">
              B
            </div>
            <div>
              <p className="font-display text-2xl leading-none">Backstage</p>
              <p className="mt-1 text-[10px] tracking-[0.22em] text-[#d9cfc3] uppercase">Admin</p>
            </div>
          </div>

          <div className="hidden items-end justify-between gap-6 lg:flex">
            <div className="max-w-md text-[#f6f1ea]">
              <p className="text-[10px] tracking-[0.28em] text-[#c4a574] uppercase">FW26 Atelier</p>
              <p className="font-display mt-3 text-5xl leading-[1.05]">Clothes that hold a courtyard.</p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#d7cdc2]">
                Sign in to the desk that runs the shop — orders, stock, and the storefront, cut to your role.
              </p>
            </div>
            <div className="mb-2 flex gap-3">
              <figure className="w-28 overflow-hidden rounded-md border border-white/20 shadow-2xl">
                <img src={LOGIN_ART.insetA} alt="" className="h-36 w-full object-cover" />
              </figure>
              <figure className="mt-8 w-28 overflow-hidden rounded-md border border-white/20 shadow-2xl">
                <img src={LOGIN_ART.insetB} alt="" className="h-36 w-full object-cover" />
              </figure>
            </div>
          </div>
        </div>
      </aside>

      <main className="relative z-10 -mt-8 flex items-center justify-center overflow-x-hidden bg-[#efe8dc] px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-0 sm:px-10 lg:mt-0 lg:px-14 lg:py-10">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-[#6b2d3c]/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 size-80 rounded-full bg-[#c4a574]/18 blur-3xl" />
        <div className="login-grain pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply" />

        <article className="relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-[#e4dcd1] bg-[#fffcf8] shadow-[0_30px_80px_-28px_rgba(28,25,23,0.35),0_1px_0_rgba(255,255,255,0.9)_inset]">
          <div className="h-[3px] bg-[linear-gradient(90deg,#c4a574_0%,#6b2d3c_52%,#c4a574_100%)]" />

          <div className="px-5 pt-6 pb-7 sm:px-8 sm:pt-7 sm:pb-8">
            <p className="text-[11px] tracking-[0.22em] text-[#9a6b24] uppercase">Staff entrance</p>
            <h1 className="font-display mt-2 text-[2rem] leading-none text-[#1c1917] sm:text-[2.35rem]">Sign in</h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Use a Super Admin or Order Manager desk.
              <span className="hidden sm:inline"> This is a frontend demo — nothing writes to a live store.</span>
            </p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <Field label="Staff ID or email">
                <Input
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="st_01 or st_02"
                  className="h-12 bg-white text-[15px] shadow-[inset_0_1px_2px_rgba(28,25,23,0.04)]"
                />
              </Field>
              <Field label="Password">
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-white pr-11 text-[15px] shadow-[inset_0_1px_2px_rgba(28,25,23,0.04)]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>
              {error ? (
                <p className="rounded-md border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <Button type="submit" className="mt-1 h-12 text-[15px]" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#e4dcd1]" />
              <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Demo desks</p>
              <span className="h-px flex-1 bg-[#e4dcd1]" />
            </div>

            <div className="mt-4 grid gap-2.5">
              <DemoDesk
                initials={DEMO_SUPER_ADMIN.initials}
                name={DEMO_SUPER_ADMIN.name}
                role={DEMO_SUPER_ADMIN.role}
                staffId={DEMO_SUPER_ADMIN.staffId}
                password={DEMO_SUPER_ADMIN.password}
                selected={selected === "admin"}
                onSelect={() => fill("admin")}
              />
              <DemoDesk
                initials={DEMO_STAFF.initials}
                name={DEMO_STAFF.name}
                role={DEMO_STAFF.role}
                staffId={DEMO_STAFF.staffId}
                password={DEMO_STAFF.password}
                selected={selected === "staff"}
                onSelect={() => fill("staff")}
              />
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

function DemoDesk({
  initials,
  name,
  role,
  staffId,
  password,
  selected,
  onSelect,
}: {
  initials: string;
  name: string;
  role: string;
  staffId: string;
  password: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition",
        selected
          ? "border-[#6b2d3c]/35 bg-[#6b2d3c]/6 shadow-[0_1px_0_rgba(107,45,60,0.08)]"
          : "border-[#e4dcd1] bg-white hover:border-[#c4a574]/70 hover:bg-[#faf6f1]",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-medium tracking-wide",
          selected ? "bg-[#6b2d3c] text-[#faf6f1]" : "bg-[#ece6dc] text-[#2c261f]",
        )}
      >
        {initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-foreground">{name}</span>
          <span className="shrink-0 text-[10px] tracking-[0.14em] text-[#9a6b24] uppercase">
            {selected ? "Filled" : "Use"}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{role}</span>
        <span className="mt-1 block font-mono text-[11px] text-[#6f675e]">
          {staffId} · {password}
        </span>
      </span>
    </button>
  );
}
