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
