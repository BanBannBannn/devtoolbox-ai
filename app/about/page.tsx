import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About",
  description:
    "Learn why DevToolBox AI exists and how it helps developers solve small tasks without login.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
        About
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
        About DevToolBox AI
      </h1>
      <div className="mt-6 space-y-5 text-lg leading-8 text-slate-600">
        <p>
          DevToolBox AI is a free developer tools website for small daily tasks:
          formatting data, drafting project docs, improving AI coding prompts,
          checking Git commands, and preparing test cases.
        </p>
        <p>
          The v1 goal is simple: useful static pages and browser-based tools
          wherever possible. Users should not need an account, a database-backed
          profile, or a paid API to get value from the site.
        </p>
        <p>
          The site is built mobile-first and SEO-friendly so beginners,
          students, and working developers can find practical help quickly.
        </p>
      </div>
    </div>
  );
}
