import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { SampleBanner } from "@/components/sample-banner";
import { DEMO_BROKER } from "@/lib/demo";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/broker");

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
          Broker sign in
        </p>
        <h1 className="mt-2 text-3xl text-ink">Document intake</h1>
      </div>
      <SampleBanner>
        Demo account is pre-filled. Email <strong>{DEMO_BROKER.email}</strong>,
        password <strong>{DEMO_BROKER.password}</strong>.
      </SampleBanner>
      <div className="rounded-xl border border-line bg-panel p-5">
        <LoginForm />
      </div>
      <p className="text-sm text-ink-soft">
        Clients do not sign in. They use the unique link from their case.
      </p>
    </div>
  );
}
