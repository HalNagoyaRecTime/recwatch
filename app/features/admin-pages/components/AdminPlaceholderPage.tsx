import { AdminPageTitle } from "~/features/admin-pages/components/AdminPageTitle";

type PlaceholderSection = {
  title: string;
  description: string;
};

type AdminPlaceholderPageProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  sections: PlaceholderSection[];
};

export function AdminPlaceholderPage({
  eyebrow,
  title,
  description,
  sections,
}: AdminPlaceholderPageProps) {
  return (
    <div className="page">
      <AdminPageTitle
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <section className="page-grid">
        {sections.map((section) => (
          <article key={section.title} className="page-panel">
            <h2 className="page-panel__title">{section.title}</h2>
            <p className="page-panel__description">{section.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
