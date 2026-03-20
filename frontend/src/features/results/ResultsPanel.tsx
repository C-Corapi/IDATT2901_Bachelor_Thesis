import { useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { colors, space, hintText, cardBase, radii } from "../../styles/tokens";
import { StatCard } from "../../components/ui/StatCard";
import { Tabs } from "../../components/ui/Tabs";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Tag } from "../../components/ui/Tag";
import type { ExtractionResult, TabId, Decision, Activity, Task, Deliverable } from "./types";

const S: Record<string, CSSProperties> = {
  stats: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: space[5] },
  tabs:  { marginTop: space[6] },
  list:  { marginTop: space[6], display: "grid", gap: space[5] },
  foot:  { marginTop: space[8], display: "flex", justifyContent: "flex-start" },
  card:  { padding: space[6], borderRadius: radii.lg },
  title: { fontWeight: 800, fontSize: 16 },
  desc:  { marginTop: space[3], color: colors.textMuted, fontSize: 14 },
  meta:  { marginTop: space[4], display: "flex", gap: space[3], flexWrap: "wrap" as const },
  owner: { ...hintText },
  empty: { padding: space[10], textAlign: "center" as const, color: colors.textFaint },
};

type Props = {
  data: ExtractionResult;
};

function DecisionCard({ item }: { item: Decision }) {
  return (
    <Card style={S.card}>
      <div style={S.title}>{item.title}</div>
      <div style={S.desc}>{item.description}</div>
      <div style={S.meta}>
        <Tag tone="blue">{item.nature || "unknown"}</Tag>
        <Tag tone="purple">{item.reach || "unknown"}</Tag>
      </div>
      <div style={{ ...S.owner, marginTop: space[3] }}>
        <span style={{ opacity: 0.8 }}>owner:</span> {item.owner}
      </div>
    </Card>
  );
}

function ActivityCard({ item }: { item: Activity }) {
  return (
    <Card style={S.card}>
      <div style={S.title}>{item.title}</div>
      <div style={S.desc}>{item.description}</div>
      <div style={S.meta}>
        <Tag tone={item.status === "Closed" ? "green" : item.status === "In Progress" ? "yellow" : "blue"}>
          {item.status}
        </Tag>
        {item.confidence && <Tag tone="neutral">{Math.round(parseFloat(item.confidence) * 100)}%</Tag>}
      </div>
      <div style={{ ...S.owner, marginTop: space[3] }}>
        <span style={{ opacity: 0.8 }}>owner:</span> {item.owner}
      </div>
    </Card>
  );
}

function TaskCard({ item }: { item: Task }) {
  return (
    <Card style={S.card}>
      <div style={S.title}>{item.title}</div>
      <div style={S.desc}>{item.description}</div>
      <div style={S.meta}>
        <Tag tone={item.status === "Closed" ? "green" : item.status === "In Progress" ? "yellow" : "blue"}>
          {item.status}
        </Tag>
        {item.confidence && <Tag tone="neutral">{Math.round(parseFloat(item.confidence) * 100)}%</Tag>}
      </div>
      <div style={{ ...S.owner, marginTop: space[3] }}>
        <span style={{ opacity: 0.8 }}>owner:</span> {item.owner}
      </div>
    </Card>
  );
}

function DeliverableCard({ item }: { item: Deliverable }) {
  return (
    <Card style={S.card}>
      <div style={S.title}>Deliverable</div>
      <div style={S.desc}>{item.requirements}</div>
      <div style={{ ...S.owner, marginTop: space[3] }}>
        <span style={{ opacity: 0.8 }}>specs:</span> {item.specifications}
      </div>
    </Card>
  );
}

export function ResultsPanel({ data }: Props) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("decisions");

  const counts = {
    decisions: data.decisions.length,
    activities: data.activities.length,
    tasks: data.tasks.length,
    deliverables: data.deliverables.length,
  };

  const total = counts.decisions + counts.activities + counts.tasks + counts.deliverables;

  return (
    <section>
      <div style={S.stats}>
        <StatCard label="Beslutninger" value={counts.decisions} tone="blue" />
        <StatCard label="Aktiviteter"  value={counts.activities} tone="green" />
        <StatCard label="Oppgaver"     value={counts.tasks} tone="yellow" />
        <StatCard label="Leveranser"   value={counts.deliverables} tone="red" />
      </div>

      <div style={S.tabs}>
        <Tabs
          items={[
            { id: "decisions",    label: "Beslutninger",  count: counts.decisions },
            { id: "activities",   label: "Aktiviteter",   count: counts.activities },
            { id: "tasks",        label: "Oppgaver",      count: counts.tasks },
            { id: "deliverables", label: "Leveranser",    count: counts.deliverables },
          ]}
          activeId={tab}
          onChange={(id) => setTab(id as TabId)}
        />
      </div>

      <div style={S.list}>
        {tab === "decisions" && data.decisions.map((d, i) => <DecisionCard key={i} item={d} />)}
        {tab === "activities" && data.activities.map((a, i) => <ActivityCard key={i} item={a} />)}
        {tab === "tasks" && data.tasks.map((t, i) => <TaskCard key={i} item={t} />)}
        {tab === "deliverables" && data.deliverables.map((d, i) => <DeliverableCard key={i} item={d} />)}
        {total === 0 && <div style={S.empty}>Ingen metadata funnet i dokumentet.</div>}
      </div>

      <div style={S.foot}>
        <Button variant="ghost" onClick={() => navigate("/")}>← Last opp nytt dokument</Button>
      </div>
    </section>
  );
}