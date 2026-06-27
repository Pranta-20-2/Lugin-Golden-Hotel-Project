"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BuildingIcon } from "@/components/ui/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const inputClass =
    "h-12 w-full rounded-xl border-0 bg-slate-50 px-4 text-sm text-slate-800 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
      <div className="flex flex-1 flex-col justify-center bg-sidebar px-6 py-10 text-white sm:px-10 lg:max-w-md lg:px-12">
        <div className="mx-auto w-full max-w-sm lg:mx-0">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand shadow-lg shadow-brand/30">
              <BuildingIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold leading-tight tracking-wide">
              Lugin Golden
            </span>
          </div>
          <h1 className="text-3xl font-bold leading-tight">
            Manage your hotel with ease
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Bookings, rooms, invoices, and reports — all in one modern dashboard.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <h2 className="mb-1 text-xl font-semibold text-slate-900">Sign in</h2>
          <p className="mb-6 text-sm text-slate-500">
            Enter your credentials to access the dashboard
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-600">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@hotel.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-600">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
