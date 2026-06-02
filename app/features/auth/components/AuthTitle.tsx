type AuthTitleProps = {
  title: string;
  description?: string;
};

export function AuthTitle({ title, description }: AuthTitleProps) {
  return (
    <div className="space-y-1 text-center">
      <h1 className="text-xl font-semibold tracking-[-0.02em] text-[color:var(--text-1)]">
        {title}
      </h1>
      {description ? (
        <p className="text-base leading-7 text-white">{description}</p>
      ) : null}
    </div>
  );
}
