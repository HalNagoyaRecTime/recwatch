import { startTransition, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

type AuthAlternativeLoginSectionProps = {
  isOAuthSubmitting?: boolean;
  onError: (message: string) => void;
};

export function AuthAlternativeLoginSection({
  isOAuthSubmitting = false,
  onError,
}: AuthAlternativeLoginSectionProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isEmailInputOpen, setIsEmailInputOpen] = useState(false);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEmailInputOpen) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      emailInputRef.current?.focus();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [isEmailInputOpen]);

  async function handleEmailLogin() {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail.length === 0) {
      onError("メールアドレスを入力してください。");
      return;
    }

    try {
      onError("");
      setIsEmailSubmitting(true);

      const params = new URLSearchParams({
        email: normalizedEmail,
      });

      startTransition(() => {
        navigate(`/login/email?${params.toString()}`);
      });
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "メールログインの開始に失敗しました。"
      );
    } finally {
      setIsEmailSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="mx-auto flex w-fit cursor-pointer px-6 py-3 text-center text-sm font-medium text-[color:var(--text-2)] transition hover:text-[color:var(--text-1)]"
        onClick={() => setIsEmailInputOpen((current) => !current)}
        aria-expanded={isEmailInputOpen}
        aria-controls="email-login-section"
      >
        {isEmailInputOpen ? "閉じる" : "そのほかの方法でログイン"}
      </button>

      <div
        id="email-login-section"
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isEmailInputOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs text-[color:var(--text-3)]">
            <div className="h-px flex-1 bg-[color:var(--border-1)]" />
            <span>メールアドレスで続ける</span>
            <div className="h-px flex-1 bg-[color:var(--border-1)]" />
          </div>

          <div className="space-y-3">
            <div className="w-full">
              <label className="mb-2 block text-left text-sm font-medium tracking-[0.06em] text-[color:var(--text-3)]">
                メールアドレス
              </label>
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleEmailLogin();
                  }
                }}
                placeholder="you@example.com"
                className="h-11 w-full rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-1)] px-4 text-sm text-[color:var(--text-1)] transition outline-none placeholder:text-[color:var(--text-3)] focus:border-[color:var(--brand-1)] focus:ring-4 focus:ring-[color:var(--surface-brand-soft)]"
              />
            </div>

            <button
              type="button"
              onClick={() => void handleEmailLogin()}
              disabled={isOAuthSubmitting || isEmailSubmitting}
              className="flex h-10 w-full cursor-pointer items-center justify-center rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-1)] px-4 text-sm font-medium text-[color:var(--text-1)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[color:var(--brand-1)]/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEmailSubmitting ? "確認中..." : "メールで認証コードを受け取る"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
