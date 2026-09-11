import { logoutAction } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="min-h-11 text-sm font-semibold text-ink-soft underline-offset-4 hover:text-ink hover:underline"
      >
        Sign out
      </button>
    </form>
  );
}
