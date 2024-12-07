import templateOptions from "../../../community/templates.json";

export default function TemplateList() {
  const filteredTemplates = templateOptions.filter(
    (template) =>
      template.href.includes("ens") || template.href.includes("simple"),
  );

  return (
    <ul className="vocs_List vocs_List_unordered">
      {filteredTemplates.map(
        ({
          title,
          description,
          href,
        }: {
          title: string;
          description: string;
          href: string;
        }) => (
          <li key={title} className="vocs_ListItem">
            <a href={href} style={{ color: "#fa6977" }}>
              {title}
            </a>
            : {description}
          </li>
        ),
      )}
    </ul>
  );
}
