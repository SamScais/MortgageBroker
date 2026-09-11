"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { DEMO_BROKER } from "@/lib/demo";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium">
        Email
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          defaultValue={DEMO_BROKER.email}
          className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          defaultValue={DEMO_BROKER.password}
          className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2.5"
        />
      </label>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-white hover:bg-[#163828] disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
