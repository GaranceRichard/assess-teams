type Props = { collapsed?: boolean };

export function LegalLink({ collapsed = false }: Props) {
  return (
    <a
      aria-label="Mentions légales et licence"
      href={`${import.meta.env.BASE_URL}legal/index.html`}
      target="_blank"
      rel="noopener noreferrer"
      title="Mentions légales et licence (nouvel onglet)"
    >
      {collapsed ? (
        <span aria-hidden="true">§</span>
      ) : (
        "Mentions légales et licence"
      )}
    </a>
  );
}
