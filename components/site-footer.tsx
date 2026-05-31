import Link from "next/link";

const footerLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/dashboard/blog/new", label: "Write" },
  { href: "/dashboard", label: "AI Workspace" },
  { href: "/tools", label: "Tools" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="font-semibold text-white">DevToolBox AI</p>
          <p className="mt-2 max-w-md text-sm leading-6">
            A developer knowledge platform for publishing articles, chatting
            with your documents, and using practical tools.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-4">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
