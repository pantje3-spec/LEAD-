import { Lead, TeamMember, AdCampaign } from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";

interface AnalyticsProps {
  leads: Lead[];
  campaigns: AdCampaign[];
  team: TeamMember[];
}

export default function AnalyticsView({ leads, campaigns, team }: AnalyticsProps) {
  // 1. Lead Sources Data Calculation
  const sourceMap: Record<string, number> = {};
  leads.forEach((l) => {
    sourceMap[l.leadSource] = (sourceMap[l.leadSource] || 0) + 1;
  });
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#f59e0b"];

  // 2. Status Breakdowns for Conversion Funnel
  const statusCounts = {
    New: leads.filter((l) => l.status === "New Lead").length,
    Contacted: leads.filter((l) => l.status === "Contacted" || l.status === "Replied").length,
    Warm: leads.filter((l) => l.status === "Interested" || l.status === "Meeting Scheduled").length,
    Won: leads.filter((l) => l.status === "Closed").length,
    Lost: leads.filter((l) => l.status === "Not Interested").length,
  };

  const funnelData = [
    { name: "New Leads", count: statusCounts.New, fill: "#3b82f6" },
    { name: "Contacted/Replied", count: statusCounts.Contacted, fill: "#a855f7" },
    { name: "Warm Prospect", count: statusCounts.Warm, fill: "#f59e0b" },
    { name: "Closed Deal 🎉", count: statusCounts.Won, fill: "#10b981" },
    { name: "Not Interested", count: statusCounts.Lost, fill: "#ef4444" },
  ];

  // 3. Campaign Performance (Ads Platform ROI)
  const campaignData = campaigns.map((c) => ({
    name: c.name.length > 22 ? c.name.substring(0, 20) + ".." : c.name,
    leads: c.leads,
    spend: Math.round(c.spend / 100), // Scaled for comparison
    revenue: Math.round(c.revenue / 100), // Scaled
    costPerLead: c.cpl,
  }));

  // 4. Team Leaderboard
  const teamData = team.map((t) => ({
    name: t.name,
    assigned: t.leadsAssigned,
    closed: t.dealsClosed,
    rate: Math.round(t.activeRate),
  }));

  // 5. Monthly SMM Recurring Revenue Simulation
  const revenueTrend = [
    { month: "Dec", revenue: 180000, spend: 35000 },
    { month: "Jan", revenue: 210000, spend: 40000 },
    { month: "Feb", revenue: 250000, spend: 45000 },
    { month: "Mar", revenue: 310000, spend: 52000 },
    { month: "Apr", revenue: 380000, spend: 59000 },
    { month: "May", revenue: 490000, spend: 75000 } // current month
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 text-slate-100 p-3 rounded-lg shadow-xl text-xs font-mono">
          <p className="font-bold text-slate-300 mb-1">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} style={{ color: item.color }} className="flex justify-between gap-4">
              <span>{item.name}:</span>
              <span className="font-semibold">
                {item.value.toLocaleString()}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-1">
      {/* 1. SMM Agency Revenue Trend Line Chart */}
      <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100" id="revenue-trend-title">Monthly Agency Metrics</h3>
            <p className="text-xs text-slate-400">Comparing SMM client revenue to internal campaign ad spend (INR)</p>
          </div>
          <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            Growth: +36%
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
              <Area type="monotone" name="SMM Client Revenue (₹)" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" name="Internal Ad Spend (₹)" dataKey="spend" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Conversion Funnel Bar Chart */}
      <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1" id="conversion-funnel-title">Lead Conversion Funnel</h3>
        <p className="text-xs text-slate-400 mb-4">Tracking client distribution by sequence stage</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.15} />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Leads Count" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Campaign Ad ROI Comparison */}
      <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1" id="campaigns-roi-title">Ad Campaign Effectiveness</h3>
        <p className="text-xs text-slate-400 mb-4">Comparing spend and revenue returned (scaled 1:100 comparison)</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={campaignData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="rect" wrapperStyle={{ fontSize: "11px" }} />
              <Bar name="Leads Generated" dataKey="leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar name="Campaign Budget / 100" dataKey="spend" fill="#a855f7" radius={[4, 4, 0, 0]} />
              <Bar name="Revenue Returned / 100" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Lead Capture Sources Pie Chart */}
      <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1" id="lead-sources-title">Lead Acquisition Channels</h3>
        <p className="text-xs text-slate-400 mb-4">Visualizing where most incoming inquiries originate</p>
        <div className="flex flex-col sm:flex-row items-center justify-around h-64">
          <div className="w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4 sm:mt-0">
            {sourceData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-3 text-xs">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}:</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold font-mono">{item.value} ({Math.round((item.value / leads.length) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Team Closures & Active Conversion rates */}
      <div className="col-span-1 lg:col-span-2 bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1" id="team-conversion-title">Team Outreach Leaderboard</h3>
        <p className="text-xs text-slate-400 mb-4">Comparing assigned leads to successfully closed SMM retainer setups</p>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teamData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
              <Bar name="Assigned Clients" dataKey="assigned" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar name="Closed Retainers" dataKey="closed" fill="#ec4899" radius={[4, 4, 0, 0]} />
              <Bar name="Success Ratio %" dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
