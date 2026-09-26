"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <section className="flex flex-1 items-center justify-center bg-bg py-20">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8">
        <p className="font-mono text-xs uppercase tracking-wide text-brand">
          JinZu Admin
        </p>
        <h1 className="mt-2 text-xl font-semibold text-ink">Sign In</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Manage JinZu applications.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-danger">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in\u2026" : "Sign In"}
          </Button>
        </form>
      </div>
    </section>
  );
}
