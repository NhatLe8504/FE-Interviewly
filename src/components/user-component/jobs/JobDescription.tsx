export function JobDescription({ text }: { text: string }) {
  const sections = text.trim().split(/(?=^#{1,3}\s)/m);
  return (
    <div>
      {sections.map((section, sectionIndex) => {
        const heading = section.match(/^#{1,3}\s+([^\n]+)\n?/);
        return (
          <section key={sectionIndex}>
            {heading && <h3>{heading[1]}</h3>}
            <p>{heading ? section.slice(heading[0].length).trim() : section}</p>
          </section>
        );
      })}
    </div>
  );
}
