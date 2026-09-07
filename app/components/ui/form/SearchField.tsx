import { Search } from "lucide-react";
import type { InputHTMLAttributes, Ref } from "react";

import { controlSurfaceStyle } from "~/components/ui/form/styles/control-styles";

type SearchFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "aria-label" | "className" | "onChange" | "type" | "value"
> & {
  ariaLabel: string;
  inputRef?: Ref<HTMLInputElement>;
  onValueChange: (value: string) => void;
  value: string;
};

/**
 * 使用例:
 * <SearchField ariaLabel="通知を検索" onValueChange={setQuery} placeholder="通知を検索" value={query} />
 */
export function SearchField({
  ariaLabel,
  autoComplete = "off",
  inputRef,
  onValueChange,
  value,
  ...props
}: SearchFieldProps) {
  return (
    <label className="group app-rounded relative flex h-9 w-full min-w-0 items-center">
      <span
        aria-hidden="true"
        className={`${controlSurfaceStyle()} group-focus-within:border-border-strong pointer-events-none absolute inset-0 group-focus-within:border-[1.4px]`}
      />
      <Search
        aria-hidden="true"
        className="text-text-subtle pointer-events-none absolute left-3 size-4.5"
      />
      <input
        {...props}
        ref={inputRef}
        aria-label={ariaLabel}
        autoComplete={autoComplete}
        className="app-rounded text-text-base placeholder:text-text-subtle absolute inset-0 w-full bg-transparent pr-3 pl-10 text-sm outline-none focus-visible:outline-none"
        onChange={(event) => onValueChange(event.currentTarget.value)}
        type="search"
        value={value}
      />
    </label>
  );
}
