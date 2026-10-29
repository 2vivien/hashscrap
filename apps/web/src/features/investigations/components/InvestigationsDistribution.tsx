import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import type { Investigation } from "../types/investigations.types";

const COLORS = ["#84cc16", "#3b82f6", "#f59e0b", "#64748b"];
const LABELS: Record<Investigation["statut"], string> = { en_cours: "En cours", terminee: "Terminées", en_attente: "En attente", annulee: "Annulées" };

export function InvestigationsDistribution({ investigations }: { investigations: Investigation[] }) {
  const data = (Object.keys(LABELS) as Investigation["statut"][]).map((status) => ({
    name: LABELS[status],
    value: investigations.filter((item) => item.statut === status).length,
  })).filter((item) => item.value > 0);
  return <Card><CardHeader><CardTitle>Répartition par statut</CardTitle></CardHeader><CardContent>
    {data.length === 0 ? <p className="py-8 text-center text-sm text-ink-muted">Aucune investigation retournée par l’API.</p> : <div className="h-[200px] w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" label>{data.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>}
  </CardContent></Card>;
}
