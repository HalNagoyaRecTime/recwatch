/**
 * cva (Class Variance Authority) ユーティリティ
 *
 * Tailwind CSS などのクラス名を、コンポーネントの状態（バリアント）ごとに
 * 簡単に管理・出し分けするための関数です。
 *
 * 例: size (sm/md/lg) や intent (primary/danger) などの組み合わせを定義し、
 * Props に応じて自動で適切なCSSクラス文字列を生成します。
 */
import { cn } from "./cn";

type Config<T> = {
  variants?: T;
  defaultVariants?: { [K in keyof T]?: keyof T[K] };
};

export function cva<T extends Record<string, Record<string, string>>>(
  baseClass: string,
  config?: Config<T>
) {
  return function (props?: { [K in keyof T]?: keyof T[K] | boolean }) {
    if (!config?.variants) return cn(baseClass);

    const variantClasses = Object.entries(config.variants).map(
      ([variantName, variantValues]) => {
        let propValue = props?.[variantName as keyof T];
        if (typeof propValue === "boolean") {
          propValue = propValue ? "true" : "false";
        }

        const finalValue =
          propValue ?? config.defaultVariants?.[variantName as keyof T];
        return finalValue ? variantValues[finalValue as string] : undefined;
      }
    );

    return cn(baseClass, ...variantClasses);
  };
}
