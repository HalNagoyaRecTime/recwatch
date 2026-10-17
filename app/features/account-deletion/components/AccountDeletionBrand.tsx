import { useRef } from "react";

function AccountDeletionLogoMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-(--deletion-logo-size)"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.4 14.4c-8.98 4.71-13.4-4.63-8.65-13.11-9.88 12.23 2.61 28.04 8.65 13.11Z"
        fill="#2AB3BF"
        fillOpacity="0.8"
      />
      <path
        d="M14.55 4.62 3.47 20.43l5.91-1.02Z"
        fill="#FCB100"
        fillOpacity="0.8"
      />
      <path
        d="M1.98 12.6c6.63-8.1 29.54-8.72 12.62 2.43 4.71-10.13-10.28-5.07-12.62-2.43Z"
        fill="#FF4000"
        fillOpacity="0.8"
      />
    </svg>
  );
}

export function AccountDeletionBrand() {
  const titleRef = useRef<HTMLSpanElement>(null);
  const activeLetters = useRef(new Set<number>());
  const lastLetter = useRef(-1);

  function jumpTitle() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const available = [0, 1, 2, 4, 5, 6, 7, 8, 9].filter(
      (index) =>
        !activeLetters.current.has(index) && index !== lastLetter.current
    );
    if (!available.length) return;
    const index = available[Math.floor(Math.random() * available.length)];
    const letters = Array.from(titleRef.current?.children ?? []).filter(
      (_, letterIndex) =>
        letterIndex === index || (index === 2 && letterIndex === 3)
    );
    activeLetters.current.add(index);
    lastLetter.current = index;
    // モバイルと同じ14pxの跳躍と、減衰比0.5・剛性550の復帰を使う。
    const duration = 710;
    const frames: Keyframe[] = [
      {
        transform: "translateY(0)",
        offset: 0,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      { transform: "translateY(-14px)", offset: 110 / duration },
    ];
    const frequency = Math.sqrt(550);
    const dampedFrequency = frequency * Math.sqrt(0.75);
    for (let step = 1; step <= 36; step++) {
      const time = step / 60;
      const offset =
        -14 *
        Math.exp(-0.5 * frequency * time) *
        (Math.cos(dampedFrequency * time) +
          Math.sin(dampedFrequency * time) / Math.sqrt(3));
      frames.push({
        transform: `translateY(${step === 36 ? 0 : offset}px)`,
        offset: (110 + time * 1000) / duration,
      });
    }
    void Promise.all(
      letters.map((letter) => letter.animate(frames, { duration }).finished)
    )
      .catch(() => {})
      .finally(() => activeLetters.current.delete(index));
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        aria-label="タイトルを跳ねさせる"
        onClick={jumpTitle}
        className="cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <AccountDeletionLogoMark />
      </button>
      <div className="flex h-12 items-center justify-center text-(length:--deletion-title-size) font-extrabold text-[#333333]">
        <span className="sr-only">RE:CREATION</span>
        <span
          ref={titleRef}
          aria-hidden="true"
          className="flex items-center gap-[0.0294118em]"
        >
          {Array.from("RE:CREATION", (letter, index) =>
            letter === ":" ? (
              <svg
                key={index}
                className="h-[1em] w-[0.333333em] shrink-0"
                viewBox="0 0 8 24"
              >
                <circle cx="4" cy="7" r="3" fill="#2AB3BF" />
                <circle cx="4" cy="17" r="3" fill="#FCB100" />
              </svg>
            ) : (
              <span
                key={index}
                className={index === 3 ? "text-[#FF4000]" : undefined}
              >
                {letter}
              </span>
            )
          )}
        </span>
      </div>
    </div>
  );
}
