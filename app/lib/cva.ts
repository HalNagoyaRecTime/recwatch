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
  compoundVariants?: Array<
    { className: string } & {
      [K in keyof T]?: keyof T[K] | boolean;
    }
  >;
};

export function cva<T extends Record<string, Record<string, string>>>(
  baseClass: string,
  config?: Config<T>
) {
  return function (props?: { [K in keyof T]?: keyof T[K] | boolean }) {
    if (!config?.variants) return cn(baseClass);

    const resolvedVariants: Array<[string, string | undefined]> = Object.keys(
      config.variants
    ).map((variantName) => {
      let propValue = props?.[variantName as keyof T];
      if (typeof propValue === "boolean") {
        propValue = propValue ? "true" : "false";
      }

      const finalValue =
        propValue ?? config.defaultVariants?.[variantName as keyof T];
      return [
        variantName,
        finalValue === undefined ? undefined : String(finalValue),
      ];
    });

    const variantClasses = resolvedVariants.map(([variantName, value]) => {
      const variantValues = config.variants?.[variantName as keyof T];
      return value ? variantValues?.[value as string] : undefined;
    });

    const compoundVariantClasses =
      config.compoundVariants
        ?.filter((compoundVariant) =>
          Object.entries(compoundVariant)
            .filter(([name]) => name !== "className")
            .every(([variantName, expectedValue]) => {
              const resolvedValue = resolvedVariants.find(
                ([name]) => name === variantName
              )?.[1];
              const normalizedExpectedValue =
                typeof expectedValue === "boolean"
                  ? expectedValue
                    ? "true"
                    : "false"
                  : expectedValue;

              return resolvedValue === normalizedExpectedValue;
            })
        )
        .map(({ className }) => className) ?? [];

    return cn(baseClass, ...variantClasses, ...compoundVariantClasses);
  };
}
