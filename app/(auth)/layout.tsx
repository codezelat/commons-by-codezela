export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 px-4 py-12">
      <div className="w-full max-w-[420px]">{children}</div>
    </div>
  );
}
