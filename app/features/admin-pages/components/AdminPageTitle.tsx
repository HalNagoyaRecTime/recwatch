type AdminPageTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function AdminPageTitle({
  eyebrow,
  title,
  description,
}: AdminPageTitleProps) {
  return (
    <header className="page-header">
      {eyebrow ? <div className="page-header__eyebrow">{eyebrow}</div> : null}
      <h1 className="page-header__title">{title}</h1>
      {description ? (
        <p className="page-header__description">{description}</p>
      ) : null}
    </header>
  );
}
