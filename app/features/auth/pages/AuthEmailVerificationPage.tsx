import { Link, useSearchParams } from "react-router";

import { AuthErrorMessage } from "~/features/auth/components/AuthErrorMessage";
import { AuthLayout } from "~/features/auth/components/AuthLayout";
import { AuthPrimaryButton } from "~/features/auth/components/AuthPrimaryButton";

const verificationDigits = Array.from({ length: 6 }, (_, index) => index);
const fallbackEmail = "you@example.com";

export function AuthEmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email")?.trim() || fallbackEmail;

  return (
    <AuthLayout>
      <div className="space-y-4">
        <p className="text-center text-base leading-7 font-medium text-white">
          {email}
          に確認用の認証コードを送信します。受信した 6
          桁のコードを入力してログインを続けてください。
        </p>

        <div
          className="flex justify-center gap-2"
          aria-label="6 digit verification code"
        >
          {verificationDigits.map((digit) => (
            <input
              key={digit}
              className="h-12 w-11 rounded-lg border border-(--border-2) bg-(--surface-1) text-center text-lg font-semibold text-(--text-1) transition outline-none placeholder:text-(--text-3) focus:border-(--brand-1) focus:ring-4 focus:ring-(--surface-brand-soft)"
              inputMode="numeric"
              maxLength={1}
              aria-label={`verification digit ${digit + 1}`}
            />
          ))}
        </div>

        <AuthErrorMessage>
          コードが届かない場合でも、この画面の挙動は接続先の適合有無で変えません。
        </AuthErrorMessage>

        <div className="space-y-3">
          <AuthPrimaryButton disabled>認証してログイン</AuthPrimaryButton>

          <Link
            to="/login"
            className="mx-auto flex w-fit px-6 py-2 text-center text-sm font-medium text-(--text-2) underline! decoration-current underline-offset-2 transition hover:text-(--text-1)"
          >
            ログイン画面に戻る
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
