type DownloadLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export function DownloadLink({
  href,
  children,
  variant = "secondary",
}: DownloadLinkProps) {
  const classes =
    variant === "primary"
      ? "inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-white"
      : "inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold";

  return (
    <a href={href} download className={classes}>
      {children}
    </a>
  );
}
