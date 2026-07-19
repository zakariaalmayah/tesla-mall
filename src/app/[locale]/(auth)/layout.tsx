import { Logo } from "@/components/layout/logo";
import { Link } from "@/i18n/routing";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-secondary/40 px-4 py-12">
      <Link href="/" className="mb-8">
        <Logo className="w-36" />
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-premium">
        {children}
      </div>
    </div>
  );
}
