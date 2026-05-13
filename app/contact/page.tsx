import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Contact",
  description:
    "Contact DevToolBox AI with feedback, tool ideas, or questions about the website.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
        Contact
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
        Contact
      </h1>
      <div className="mt-6 space-y-5 text-lg leading-8 text-slate-600">
        <p>
          Have feedback, a tool idea, or a correction? Send a message to{" "}
          <a
            href="mailto:hello@devtoolbox.ai"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            hello@devtoolbox.ai
          </a>
          .
        </p>
        <p>
          There is no contact form in v1 so the site can stay simple, static,
          and easy to maintain.
        </p>
      </div>
    </div>
  );
}
