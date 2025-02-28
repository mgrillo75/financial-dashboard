import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { StyledMyBalanceChart } from './style';
import { useTheme } from 'styled-components';
import { useDashboardContext } from '../../../../../hooks/useDashboardContext';
import SkeletonCharts from '../../../../../components/Layout/Skeleton/components/SkeletonCharts';
import { useMemo } from 'react';

// Helper function for currency formatting
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Categories that should always be counted as income regardless of other factors
const INCOME_CATEGORIES = ['Income', 'Cryptocurrency'];

const MyBalanceChart = () => {
  const { loading, transactions } = useDashboardContext();
  const theme = useTheme();

  // Calculate monthly income and spending data from transactions
  const monthlyChartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    // Group transactions by month and calculate income and spending
    const monthlyData: Record<string, { name: string, income: number, spend: number, year: number }> = {};
    
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Process all transactions
    sortedTransactions.forEach(transaction => {
      // Extract month and year from the date (e.g., "2024-04-15" -> "Apr 2024")
      const date = new Date(transaction.date);
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;
      
      // Initialize the month if it doesn't exist
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          name: monthYear,
          income: 0,
          spend: 0,
          year: year
        };
      }
      
      // Add to income or spend based on the transaction amount and category
      if (transaction.amount > 0) {
        // Consider all positive amounts as income
        monthlyData[monthYear].income += transaction.amount;
      } else if (transaction.amount < 0) {
        monthlyData[monthYear].spend += Math.abs(transaction.amount);
      }
    });
    
    // Convert to array and sort chronologically
    return Object.values(monthlyData)
      .sort((a, b) => {
        // Sort by year first, then by month
        const aDate = new Date(`${a.name.split(' ')[0]} 1, ${a.year}`);
        const bDate = new Date(`${b.name.split(' ')[0]} 1, ${b.year}`);
        return aDate.getTime() - bDate.getTime();
      });
    
  }, [transactions]);

  return loading ? (
    <SkeletonCharts />
  ) : (
    <StyledMyBalanceChart>
      <div className="header">
        <h3>My Balance</h3>
        <div className="situation">
          <span className="income">
            <span></span>
            Income
          </span>
          <span className="spend">
            <span></span>
            Spend
          </span>
        </div>
      </div>
      <div className="chart">
        <ResponsiveContainer width="99%" height="100%">
          <AreaChart
            data={monthlyChartData}
            margin={{
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
            </defs>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              padding={{ left: 24 }}
            />
            <YAxis tickLine={false} axisLine={false} />
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
              formatter={(value) => {
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
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </StyledMyBalanceChart>
  );
};

export default MyBalanceChart;
