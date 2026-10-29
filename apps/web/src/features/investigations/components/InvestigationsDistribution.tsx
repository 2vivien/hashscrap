import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "Web", value: 65 },
  { name: "API", value: 25 },
  { name: "Réseau", value: 10 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

interface InvestigationsDistributionProps {
  // Add any props if needed
}

export function InvestigationsDistribution({}: InvestigationsDistributionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}