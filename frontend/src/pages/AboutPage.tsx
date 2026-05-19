import React from 'react';
import { Umbrella, Split, PackageCheck, ClipboardList, ClipboardCheck } from "lucide-react";

const TYPES = [
  { icon: Umbrella,       name: 'Epic',        desc: 'An epic (EPIC) is a major project goal. It can be composed ' +
        'of decisions, deliverables, activities, and tasks.'},
  { icon: Split,          name: 'Decision',     desc: 'A decision (DEC) is a choice that needs to be made to ' +
        'determine how a project is to be completed.' },
  { icon: PackageCheck,   name: 'Deliverable',  desc: 'A deliverable (DEL) is a major result than needs to be ' +
        'delivered to complete and epic. It can be composed of activities and tasks.' },
  { icon: ClipboardList,  name: 'Activity',     desc: 'An activity (ACT) is a means to an end (deliverables). ' +
        'It describe how the project work is executed and can be decomposed into tasks.' },
  { icon: ClipboardCheck, name: 'Task',         desc: 'A task (TSK) is an individual, actionable work item, ' +
        'which cannot be further decomposed into any smaller parts.' },
];

const AboutPage: React.FC = () => (
  <section aria-labelledby="about-heading">
    <h1 id="about-heading" className="page-title">About</h1>
    <div className="about-content">
      <div className="about-card">
        <h2>IDATT2901 Bachelor Thesis – NTNU Trondheim</h2>
        <p>
          This system is a tool made to help teams implement the agile Rolling Wave Planning method
          developed by Hyves Project Research
          to increase efficiency by enabling easier
          information retrieval from documents, made with next-gen agile in mind.
          The system uses an LLM in order to retrieve, as well as verify, specific
          metadata elements from project files.
        </p>
      </div>
      <p>
        Upload your project documents to extract
        structured metadata such as Epics, Decisions, Deliverables, Tasks, and
        Activities. Extracted items can be reviewed immediately after upload and will
        also be available on the Overview page and the Kanban board. You can also manually
        create a metadata element on the Overview page. Uploaded project documentation
        can be viewed on the Documents page.
      </p>
      <h2 className="page-title" style={{fontSize: '1.1rem', marginTop: 20}}>Metadata Types</h2>
      <div className="about-types" role="list" aria-label="Metadata type descriptions">
        {TYPES.map((t) => {
          const Icon = t.icon;
          return (
              <div className="about-type" key={t.name} role="listitem" title={`${t.name}: ${t.desc}`}>
                <h3 style={{color: 'var(--blue-dark)', fontSize: '.95rem', marginBottom: 4}}>
                  <span aria-hidden="true"><Icon size={16} strokeWidth={1.5}/> </span>{t.name}
                </h3>
                <p>{t.desc}</p>
              </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default AboutPage;