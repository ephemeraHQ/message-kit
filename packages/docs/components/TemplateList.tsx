import templateOptions from "../../../community/templates.json";

export default function TemplateList() {
  return (
    <ul className="vocs_List vocs_List_unordered">
      {templateOptions.map(
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
