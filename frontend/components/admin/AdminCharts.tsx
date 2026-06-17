'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ChartSlice {
  name: string;
  value: number;
  color: string;
}

interface MonthlyActivity {
  month: string;
  users: number;
  vendors: number;
  bookings: number;
}

interface PlatformOverviewItem {
  name: string;
  count: number;
  color: string;
}

interface AdminChartsProps {
  usersByRole: ChartSlice[];
  vendorsByStatus: ChartSlice[];
  bookingsByStatus: ChartSlice[];
  messagesByStatus: ChartSlice[];
  monthlyActivity: MonthlyActivity[];
  platformOverview: PlatformOverviewItem[];
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-64 flex items-center justify-center text-sm text-gray-400">
      No {label} data yet
    </div>
  );
}

function PieChartCard({
  title,
  data,
}: {
  title: string;
  data: ChartSlice[];
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      {data.length === 0 ? (
        <EmptyChart label={title.toLowerCase()} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function AdminCharts({
  usersByRole,
  vendorsByStatus,
  bookingsByStatus,
  messagesByStatus,
  monthlyActivity,
  platformOverview,
}: AdminChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Overview</h3>
          {platformOverview.every((item) => item.count === 0) ? (
            <EmptyChart label="platform" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={platformOverview}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Count" radius={[8, 8, 0, 0]}>
                  {platformOverview.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Activity (Last 6 Months)</h3>
          {monthlyActivity.every(
            (item) => item.users === 0 && item.vendors === 0 && item.bookings === 0,
          ) ? (
            <EmptyChart label="monthly activity" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" name="Users" fill="#2196F3" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vendors" name="Vendors" fill="#FF9800" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bookings" name="Bookings" fill="#755A7B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <PieChartCard title="Users by Role" data={usersByRole} />
        <PieChartCard title="Vendors by Status" data={vendorsByStatus} />
        <PieChartCard title="Bookings by Status" data={bookingsByStatus} />
        <PieChartCard title="Messages by Status" data={messagesByStatus} />
      </div>
    </div>
  );
}
