import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/ui/dashboard/card';
import { BarChart } from '@tremor/react';
import { lusitana } from '@/app/ui/fonts';
import { useState } from 'react';

export default async function RevenueChart({
  revenue,
}: {
  revenue: Revenue[];
}) {
  const chartHeight = 350;
  // Add state for tracking whether user has drilled into a month and which view to show
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [chartView, setChartView] = useState<'shaded' | 'daily'>('shaded');

  // Format the data for the chart
  const data = revenue.map((month) => ({
    name: month.month,
    "Total Revenue": month.revenue,
  }));

  // Function to handle month click for drill-down
  const handleMonthClick = (month: string) => {
    setSelectedMonth(month);
  };

  // Function to handle back button click
  const handleBackClick = () => {
    setSelectedMonth(null);
  };

  // Mock daily data - in a real application, you would fetch this data based on the selected month
  const getDailyData = (month: string) => {
    // This would be replaced with actual daily data for the selected month
    const daysInMonth = month === 'Jan' ? 31 : month === 'Feb' ? 28 : 30;
    return Array.from({ length: daysInMonth }, (_, i) => ({
      day: `${i + 1}`,
      "Category 1": Math.floor(Math.random() * 100),
      "Category 2": Math.floor(Math.random() * 150),
      "Category 3": Math.floor(Math.random() * 120),
    }));
  };

  return (
    <Card className="sm:col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          {selectedMonth ? (
            <>
              <button onClick={handleBackClick} className="mr-2 text-sm bg-gray-100 p-1 rounded">
                ← Back
              </button>
              {selectedMonth} Revenue
            </>
          ) : (
            'Revenue'
          )}
        </CardTitle>
        <CardDescription>Revenue by month</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedMonth ? (
          <>
            <div className="mb-4 flex gap-2">
              <button 
                onClick={() => setChartView('shaded')}
                className={`px-3 py-1 text-sm rounded-md ${
                  chartView === 'shaded' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Monthly Summary
              </button>
              <button 
                onClick={() => setChartView('daily')}
                className={`px-3 py-1 text-sm rounded-md ${
                  chartView === 'daily' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Daily Breakdown
              </button>
            </div>

            {chartView === 'shaded' ? (
              // Monthly summary view with 3 shaded areas
              <BarChart
                className={`${lusitana.className} mt-4`}
                data={[
                  {
                    name: selectedMonth,
                    "Category 1": 400,
                    "Category 2": 300,
                    "Category 3": 200,
                  }
                ]}
                index="name"
                categories={["Category 1", "Category 2", "Category 3"]}
                colors={["emerald", "blue", "rose"]}
                stack={true}
                height={chartHeight}
                yAxisWidth={30}
              />
            ) : (
              // Daily stacked view
              <BarChart
                className={`${lusitana.className} mt-4`}
                data={getDailyData(selectedMonth)}
                index="day"
                categories={["Category 1", "Category 2", "Category 3"]}
                colors={["emerald", "blue", "rose"]}
                stack={true}
                height={chartHeight}
                yAxisWidth={30}
              />
            )}
          </>
        ) : (
          // Original overview chart - when clicking on a month, it will drill down
          <BarChart
            className={`${lusitana.className} mt-4`}
            data={data}
            index="name"
            categories={["Total Revenue"]}
            colors={["blue"]}
            height={chartHeight}
            yAxisWidth={30}
            onValueClick={(item) => handleMonthClick(item.name as string)}
          />
        )}
      </CardContent>
    </Card>
  );
} 