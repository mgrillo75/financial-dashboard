// src/pages/dashboard/components/Charts/MyBalance/index.tsx
import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { useTheme } from 'styled-components';
import { useDashboardContext } from '../../../../../hooks/useDashboardContext';
import SkeletonCharts from '../../../../../components/Layout/Skeleton/components/SkeletonCharts';
import { useMemo, useState } from 'react';
import { StyledMyBalanceChart } from './style';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const MyBalanceChart = () => {
  const { loading, transactions } = useDashboardContext();
  const theme = useTheme();

  // Track which month is selected and which type of chart to show
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'area' | 'stacked'>('area');

  // Collect a sorted list of months (e.g. "Apr 2024") from the transactions
  const months = useMemo(() => {
    if (!transactions?.length) return [];
    const uniqueMonths = new Set<string>();

    // Get all months from transactions
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const monthStr = d.toLocaleString('default', { month: 'short' });
      const yearStr = d.getFullYear();
      uniqueMonths.add(`${monthStr} ${yearStr}`);
    });

    // Make sure Jan, Feb, Mar 2025 are included
    ['Jan', 'Feb', 'Mar'].forEach(month => {
      uniqueMonths.add(`${month} 2025`);
    });

    // Sort them chronologically
    return Array.from(uniqueMonths).sort((a, b) => {
      const aDate = new Date(a);
      const bDate = new Date(b);
      return aDate.getTime() - bDate.getTime();
    });
  }, [transactions]);

  // Don't limit months - show all available months
  const recentMonths = useMemo(() => {
    return months;
  }, [months]);

  // Build data for EITHER "All Months" in area form OR "selectedMonth" daily data
  const chartData = useMemo(() => {
    if (!transactions?.length) return [];

    // No specific month selected => monthly summary
    if (!selectedMonth) {
      // Summarize income & spend per month
      const monthlyData: Record<string, { name: string; income: number; spend: number; cash: number }> = {};
      let runningCash = 15000; // a baseline starting value

      // Sort by date so we can accumulate "cash" in chronological order
      const sorted = [...transactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Make sure we have entries for all months from 2024-01 through 2025-03
      // This ensures the chart shows all months even if some don't have transactions
      const allMonths = [];
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2025-03-31');
      
      // Create entries for all months in the range
      for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
        const monthStr = d.toLocaleString('default', { month: 'short' });
        const yearStr = d.getFullYear();
        const label = `${monthStr} ${yearStr}`;
        if (!monthlyData[label]) {
          monthlyData[label] = { name: label, income: 0, spend: 0, cash: 0 };
        }
      }

      // Process all transactions
      for (const t of sorted) {
        const d = new Date(t.date);
        const monthStr = d.toLocaleString('default', { month: 'short' });
        const yearStr = d.getFullYear();
        const label = `${monthStr} ${yearStr}`;
        if (!monthlyData[label]) {
          monthlyData[label] = { name: label, income: 0, spend: 0, cash: 0 };
        }
        if (t.amount > 0) {
          monthlyData[label].income += t.amount;
        } else {
          monthlyData[label].spend += Math.abs(t.amount);
        }
      }

      // Now compute running cash
      const result = Object.values(monthlyData).sort((a, b) => {
        // Sort by date
        const [am, ay] = a.name.split(' ');
        const [bm, by] = b.name.split(' ');
        return new Date(`${am} 1, ${ay}`).getTime() - new Date(`${bm} 1, ${by}`).getTime();
      });

      for (const row of result) {
        runningCash += row.income - row.spend;
        row.cash = runningCash;
      }
      return result;
    }

    // If a specific month is selected => daily data
    // We still produce "income/spend/cash" for the area chart,
    // and we also produce category-based sums for the stacked chart.
    const [monthLabel, yearLabel] = selectedMonth.split(' ');
    const monthIndex = new Date(`${monthLabel} 1, 2000`).getMonth();
    const year = parseInt(yearLabel, 10);

    // Filter to only that month's transactions
    const filtered = transactions.filter((t) => {
      try {
        const d = new Date(t.date);
        return d.getMonth() === monthIndex && d.getFullYear() === year;
      } catch (e) {
        console.error('Error parsing date', t.date, e);
        return false;
      }
    });

    console.log(`Filtered ${filtered.length} transactions for ${selectedMonth}`);

    // ============== For area chart data ==============
    const dailyDataByArea: Record<string, { name: string; income: number; spend: number; cash: number }> = {};
    let dailyCash = 20000; // some baseline for the month

    // Sort these transactions by date
    const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Process selected month's transactions by day
    for (const t of sorted) {
      const date = new Date(t.date);
      const day = date.getDate();
      const dateKey = `${monthLabel} ${day}`;
      
      if (!dailyDataByArea[dateKey]) {
        dailyDataByArea[dateKey] = { name: dateKey, income: 0, spend: 0, cash: 0 };
      }
      
      if (t.amount > 0) {
        dailyDataByArea[dateKey].income += t.amount;
      } else {
        dailyDataByArea[dateKey].spend += Math.abs(t.amount);
      }
    }

    // Get all days in the month to ensure continuous data
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const fullMonthData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${monthLabel} ${day}`;
      if (dailyDataByArea[dateKey]) {
        fullMonthData.push(dailyDataByArea[dateKey]);
      } else {
        // Add empty data for days with no transactions
        fullMonthData.push({
          name: dateKey,
          income: 0,
          spend: 0,
          date: new Date(year, monthIndex, day)
        });
      }
    }
    
    // Calculate running cash balance
    for (let i = 0; i < fullMonthData.length; i++) {
      // Add income and subtract spending from the daily cash value
      dailyCash += (fullMonthData[i].income || 0) - (fullMonthData[i].spend || 0);
      fullMonthData[i].cash = dailyCash;
    }
    
    // ============== For stacked chart data ==============
    // We sum expenses by category for each day
    const dailyCategorySums: Record<string, Record<string, number>> = {};

    for (const t of filtered) {
      if (t.amount < 0) {
        const dateObj = new Date(t.date);
        const day = dateObj.getDate();
        const label = `${monthLabel} ${day}`;
        if (!dailyCategorySums[label]) {
          dailyCategorySums[label] = {};
        }
        const cat = t.category || 'Other';
        if (!dailyCategorySums[label][cat]) {
          dailyCategorySums[label][cat] = 0;
        }
        dailyCategorySums[label][cat] += Math.abs(t.amount);
      }
    }

    // Also fill missing days with 0
    const resultStack = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const label = `${monthLabel} ${day}`;
      resultStack.push({
        name: label,
        ...(dailyCategorySums[label] || {}),
      });
    }

    // We'll store them so we can pick which data to feed to each chart type
    return {
      dailyArea: fullMonthData,
      dailyStack: resultStack,
    };
  }, [transactions, selectedMonth]);

  // Collect all possible categories for stacked bars
  const allCategories = useMemo(() => {
    if (!selectedMonth || !chartData || Array.isArray(chartData)) return [];
    const { dailyStack } = chartData;
    const categorySet = new Set<string>();
    dailyStack.forEach((item: any) => {
      Object.keys(item).forEach((key) => {
        if (key !== 'name') categorySet.add(key);
      });
    });
    return Array.from(categorySet);
  }, [chartData, selectedMonth]);

  // On render
  if (loading) {
    return <SkeletonCharts />;
  }

  // If no transactions or chartData is empty
  if (!transactions?.length || !chartData) {
    return <p>No data</p>;
  }

  return (
    <StyledMyBalanceChart>
      {/* Month selection buttons */}
      <div className="header">
        <div className="month-buttons">
          <button
            className={!selectedMonth ? 'month-button active' : 'month-button'}
            onClick={() => setSelectedMonth(null)}
          >
            All Months
          </button>

          {recentMonths.map((m) => (
            <button
              key={m}
              className={selectedMonth === m ? 'month-button active' : 'month-button'}
              onClick={() => setSelectedMonth((prev) => (prev === m ? null : m))}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* If user selects a specific month, show 2 buttons to choose chart type */}
      {selectedMonth && (
        <div className="chart-type-buttons">
          <button
            onClick={() => setChartType('area')}
            className={`month-button ${chartType === 'area' ? 'active' : ''}`}
          >
            Show 3-Shaded
          </button>
          <button
            onClick={() => setChartType('stacked')}
            className={`month-button ${chartType === 'stacked' ? 'active' : ''}`}
          >
            Show Stacked
          </button>
        </div>
      )}

      {/* Render either the monthly area chart or one of the daily charts */}
      <div className="chart">
        {!selectedMonth && (
          // ===================== 3-shaded Area Chart (monthly) =====================
          <ResponsiveContainer width="99%" height="100%">
            <AreaChart
              data={Array.isArray(chartData) ? chartData : []} // monthly data if no month selected
              margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#54E0A5" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#13231C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5D2AC9" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#1C0A24" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB627" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#332711" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                padding={{ left: 24 }}
                interval={0}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
              />
              <CartesianGrid
                stroke={theme.colors.border}
                horizontal={true}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.colors.toolTipBackground,
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.toolTipBorder}`,
                  backdropFilter: 'blur(3px)',
                  textTransform: 'capitalize',
                }}
                formatter={(value, name) => {
                  if (name === 'cash') {
                    return [`$${formatCurrency(value as number)}`, 'Cash on Hand'];
                  }
                  if (name === 'income') {
                    return [`$${formatCurrency(value as number)}`, 'Income'];
                  }
                  if (name === 'spend') {
                    return [`$${formatCurrency(value as number)}`, 'Spend'];
                  }
                  return [`$${formatCurrency(value as number)}`, null];
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke={theme.colors.secondary}
                fillOpacity={1}
                strokeWidth={2}
                fill="url(#colorIncome)"
              />
              <Area
                type="monotone"
                dataKey="spend"
                stroke={theme.colors.primary}
                strokeWidth={2}
                fill="url(#colorSpend)"
              />
              <Area
                type="monotone"
                dataKey="cash"
                stroke="#FFCB57"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCash)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {selectedMonth && chartType === 'area' && (
          // ===================== 3-shaded Area Chart (daily) =====================
          <ResponsiveContainer width="99%" height="100%">
            <AreaChart
              data={!Array.isArray(chartData) ? chartData.dailyArea : []}
              margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#54E0A5" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#13231C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5D2AC9" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#1C0A24" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB627" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#332711" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                padding={{ left: 24 }}
                // For single month view, limit the number of ticks shown
                interval={selectedMonth ? Math.floor(new Date(new Date(selectedMonth).getFullYear(), new Date(`${selectedMonth.split(' ')[0]} 1, 2000`).getMonth() + 1, 0).getDate() / 7) : 0}
                tickFormatter={(value) => {
                  if (selectedMonth) {
                    // For single month view, just show the day
                    return value.split(' ')[1];
                  }
                  return value;
                }}
              />
              <YAxis tickLine={false} axisLine={false} />
              <CartesianGrid stroke={theme.colors.border} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.colors.toolTipBackground,
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.toolTipBorder}`,
                  backdropFilter: 'blur(3px)',
                }}
                formatter={(value, name) => {
                  if (name === 'cash') return [`$${formatCurrency(value as number)}`, 'Cash on Hand'];
                  if (name === 'income') return [`$${formatCurrency(value as number)}`, 'Income'];
                  if (name === 'spend') return [`$${formatCurrency(value as number)}`, 'Spend'];
                  return [`$${formatCurrency(value as number)}`, name];
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke={theme.colors.secondary}
                fill="url(#colorIncome)"
                fillOpacity={1}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="spend"
                stroke={theme.colors.primary}
                fill="url(#colorSpend)"
                fillOpacity={1}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="cash"
                stroke="#FFCB57"
                fill="url(#colorCash)"
                fillOpacity={1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {selectedMonth && chartType === 'stacked' && (
          // ===================== Stacked Vertical Chart (daily expenses) =====================
          <ResponsiveContainer width="99%" height="100%">
            <BarChart data={!Array.isArray(chartData) ? chartData.dailyStack : []}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <CartesianGrid stroke={theme.colors.border} vertical={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.colors.toolTipBackground,
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.toolTipBorder}`,
                  backdropFilter: 'blur(3px)',
                }}
                formatter={(val) => `$${formatCurrency(val as number)}`}
              />
              <Legend />
              {allCategories.map((cat, index) => {
                // Generate different colors for different categories
                const colors = [
                  '#54E0A5', // Green
                  '#5D2AC9', // Purple  
                  '#FFB627', // Yellow
                  '#FF6B6B', // Red
                  '#4ECDC4', // Teal
                  '#F6AE2D', // Orange
                  '#86BBD8', // Blue
                  '#F26419', // Burnt Orange
                  '#33658A', // Navy
                  '#9A348E', // Magenta
                  '#59A96A', // Forest Green
                  '#9CAFB7', // Silver
                  '#D62246', // Crimson
                  '#45B69C', // Mint
                  '#EE6C4D'  // Coral
                ];
                
                // Cycle through colors if we have more categories than colors
                const colorIndex = index % colors.length;
                
                return (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    stackId="expenses"
                    fill={colors[colorIndex]}
                    // Display name nicely formatted in legend
                    name={cat.replace(/([A-Z])/g, ' $1').trim()}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="legends">
        <span className="income">
          <span></span> Income
        </span>
        <span className="spend">
          <span></span> Spend
        </span>
        <span className="cash">
          <span></span> Cash on Hand
        </span>
      </div>
    </StyledMyBalanceChart>
  );
};

export default MyBalanceChart;
