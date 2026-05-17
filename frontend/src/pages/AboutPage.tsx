import React from 'react';
import { Umbrella, Split, PackageCheck, ClipboardList, ClipboardCheck } from "lucide-react";

const TYPES = [
  { icon: Umbrella,       name: 'Epic',        desc: 'Major planned features or capabilities' },
  { icon: Split,          name: 'Decision',     desc: 'Decisions with alternatives & ownership' },
  { icon: PackageCheck,   name: 'Deliverable',  desc: 'Tangible or intangible project results' },
  { icon: ClipboardList,  name: 'Activity',     desc: 'Ongoing project activities' },
  { icon: ClipboardCheck, name: 'Task',         desc: 'Individual actionable work items' },
];

const AboutPage: React.FC = () => (
  <section aria-labelledby="about-heading">
    <h1 id="about-heading" className="page-title">About</h1>
    <div className="about-content">
      <div className="about-card">
        <h2>IDATT2901 Bachelor Thesis – NTNU Trondheim</h2>
        <p>
          This system is a tool made to increase efficiency by enabling easier
          information retrieval from documents, made with next-gen agile in mind.
          The system uses LLMs in order to retrieve, as well as verify, specific
          data elements from project files.
        </p>
      </div>
      <p>
        Upload your project documents and the system will automatically extract
        structured metadata such as Epics, Decisions, Deliverables, Tasks, and
        Activities. Each extracted item can be reviewed and managed
        through the Kanban board.
      </p>
      <h2 className="page-title" style={{fontSize: '1.1rem', marginTop: 20}}>Metadata Types</h2>
      <div className="about-types" role="list" aria-label="Metadata type descriptions">
        {TYPES.map((t) => {
          const Icon = t.icon;
          return (
              <article className="about-type" key={t.name} role="listitem" title={`${t.name}: ${t.desc}`}>
                <h3 style={{color: 'var(--blue-dark)', fontSize: '.95rem', marginBottom: 4}}>
                  <span aria-hidden="true"><Icon size={16} strokeWidth={1.5}/> </span>{t.name}
                </h3>
                <p>{t.desc}</p>
              </article>
          );
        })}
      </div>
    </div>
  </section>
);

export default AboutPage;