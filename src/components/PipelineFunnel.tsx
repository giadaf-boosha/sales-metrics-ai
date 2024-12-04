import {
  Funnel,
  FunnelChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { value: 1200, name: "Total Opportunities", fill: "#6366f1" },
  { value: 850, name: "Qualified", fill: "#8b5cf6" },
  { value: 400, name: "Proposal", fill: "#a855f7" },
  { value: 200, name: "Negotiation", fill: "#d946ef" },
  { value: 120, name: "Closed Won", fill: "#22c55e" },
];

export function PipelineFunnel() {
  return (
    <div className="h-[400px] w-full rounded-xl bg-white p-6 shadow-sm animate-fade-in">
      <h3 className="mb-6 text-lg font-semibold">Sales Pipeline</h3>
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "none",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Funnel
            dataKey="value"
            data={data}
            isAnimationActive
          >
            <LabelList
              position="right"
              fill="#64748b"
              stroke="none"
              dataKey="name"
            />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
}