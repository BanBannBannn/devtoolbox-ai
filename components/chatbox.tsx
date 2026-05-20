"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, Trash2, X } from "lucide-react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ChatApiResponse =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

const MAX_MESSAGE_LENGTH = 1000;
const MAX_CONVERSATION_MESSAGES = 10;
const chatEnabled = process.env.NEXT_PUBLIC_CHAT_ENABLED === "true";

function getMessagesForRequest(messages: ChatMessage[]) {
  return messages.slice(-MAX_CONVERSATION_MESSAGES);
}

export function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const remainingCharacters = useMemo(
    () => MAX_MESSAGE_LENGTH - input.length,
    [input],
  );

  if (!chatEnabled) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = input.trim();

    if (!content) {
      setError("Please enter a message.");
      return;
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      setError(`Messages must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content,
      },
    ];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: getMessagesForRequest(nextMessages),
        }),
      });

      const data = (await response.json()) as ChatApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.success ? "Chat request failed." : data.error,
        );
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: data.message,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Chat is unavailable right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    setMessages([]);
    setInput("");
    setError("");
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      {isOpen ? (
        <section
          aria-label="DevToolBox AI chat"
          className="flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 sm:max-h-[36rem]"
        >
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-950 px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-slate-950">
                <Bot className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold">
                  DevToolBox AI
                </h2>
                <p className="truncate text-xs text-slate-300">
                  Tools help and quick dev answers
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-cyan-300 focus:outline-none"
              aria-label="Close chat"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </header>

          <div className="flex min-h-72 flex-1 flex-col gap-3 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-600">
                Ask about a DevToolBox AI tool or a simple developer question.
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                    message.role === "user"
                      ? "ml-auto bg-slate-950 text-white"
                      : "mr-auto border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {message.content}
                </div>
              ))
            )}
            {isLoading ? (
              <div className="mr-auto flex max-w-[88%] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Thinking...
              </div>
            ) : null}
          </div>

          {error ? (
            <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-white p-3"
          >
            <label htmlFor="chatbox-message" className="sr-only">
              Message
            </label>
            <textarea
              id="chatbox-message"
              value={input}
              onChange={(event) => {
                setInput(event.target.value.slice(0, MAX_MESSAGE_LENGTH));
                setError("");
              }}
              disabled={isLoading}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100"
              placeholder="Ask how to use a tool..."
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <span
                className={`text-xs ${
                  remainingCharacters < 100 ? "text-amber-700" : "text-slate-500"
                }`}
              >
                {remainingCharacters} left
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isLoading && messages.length === 0}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:bg-slate-100 focus:ring-2 focus:ring-cyan-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Clear chat history"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="inline-flex size-9 items-center justify-center rounded-full bg-slate-950 text-white transition hover:bg-slate-800 focus:ring-2 focus:ring-cyan-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-300"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition hover:bg-slate-800 focus:ring-2 focus:ring-cyan-300 focus:outline-none"
          aria-label="Open DevToolBox AI chat"
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          <span>Ask AI</span>
        </button>
      )}
    </div>
  );
}
