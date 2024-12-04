import React from 'react';
import {
  Funnel,
  FunnelChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { SalesData } from "@/utils/googleSheets";

interface PipelineFunnelProps {
  data?: SalesData[];
}

export function PipelineFunnel({ data }: PipelineFunnelProps) {
  const funnelData = React.useMemo(() => {
    if (!data) return [];

    const totalOpportunities = data.length;
    const meetingsScheduled = data.filter(d => d.meetingScheduled).length;
    const meetingsCompleted = data.filter(d => d.meetingCompleted).length;
    const proposalsSent = data.filter(d => d.proposalSent).length;
    const contractsClosed = data.filter(d => d.contractsClosed).length;

    return [
      { value: totalOpportunities, name: "Total Opportunities", fill: "#6366f1" },
      { value: meetingsScheduled, name: "Meetings Scheduled", fill: "#8b5cf6" },
      { value: meetingsCompleted, name: "Meetings Completed", fill: "#a855f7" },
      { value: proposalsSent, name: "Proposals Sent", fill: "#d946ef" },
      { value: contractsClosed, name: "Contracts Closed", fill: "#22c55e" },
    ];
  }, [data]);

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
            data={funnelData}
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