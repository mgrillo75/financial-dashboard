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
import { useMemo, useState } from 'react';

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
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  
  // Calculate data based on whether we're viewing all months or a specific month
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    // If no month is selected, show monthly data (12-month view)
    if (!selectedMonth) {
      // Group transactions by month and calculate income and spending
      const monthlyData: Record<string, { name: string, income: number, spend: number, cash: number, year: number }> = {};
      
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
            cash: 0,
            year: year
          };
        }
        
        // Add to income or spend based on the transaction amount
        if (transaction.amount > 0) {
          monthlyData[monthYear].income += transaction.amount;
        } else if (transaction.amount < 0) {
          monthlyData[monthYear].spend += Math.abs(transaction.amount);
        }
      });
      
      // Convert to array and sort chronologically
      let monthlyArray = Object.values(monthlyData)
        .sort((a, b) => {
          // Sort by year first, then by month
          const aDate = new Date(`${a.name.split(' ')[0]} 1, ${a.year}`);
          const bDate = new Date(`${b.name.split(' ')[0]} 1, ${b.year}`);
          return aDate.getTime() - bDate.getTime();
        });
      
      // Calculate running cash balance
      let runningCash = 15000; // Start with a baseline amount for dummy data
      monthlyArray = monthlyArray.map(month => {
        runningCash = runningCash + month.income - month.spend;
        return {
          ...month,
          cash: runningCash
        };
      });
      
      return monthlyArray;
    } 
    // If a month is selected, show daily data for that month
    else {
      // Extract the month and year from the selected month string (e.g. "Apr 2024")
      const [monthStr, yearStr] = selectedMonth.split(' ');
      const monthIndex = new Date(`${monthStr} 1, 2000`).getMonth();
      const year = parseInt(yearStr);
      
      // Filter transactions to only include those from the selected month
      const filteredTransactions = transactions.filter(transaction => {
        const transDate = new Date(transaction.date);
        return transDate.getMonth() === monthIndex && transDate.getFullYear() === year;
      });
      
      // Group transactions by day
      const dailyData: Record<string, { name: string, income: number, spend: number, cash: number, date: Date }> = {};
      
      // Sort transactions by date
      const sortedTransactions = [...filteredTransactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Process selected month's transactions by day
      sortedTransactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const day = date.getDate();
        const dateKey = `${monthStr} ${day}`;
        
        // Initialize the day if it doesn't exist
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = {
            name: dateKey,
            income: 0,
            spend: 0,
            cash: 0,
            date: date
          };
        }
        
        // Add to income or spend based on the transaction amount
        if (transaction.amount > 0) {
          dailyData[dateKey].income += transaction.amount;
        } else if (transaction.amount < 0) {
          dailyData[dateKey].spend += Math.abs(transaction.amount);
        }
      });
      
      // Get all days in the month to ensure continuous data
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      let fullMonthData = [];
      
      // Initial cash value for this month (dummy data)
      let startingCash = 20000 + Math.random() * 5000;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${monthStr} ${day}`;
        
        if (dailyData[dateKey]) {
          // Update cash with today's transactions
          startingCash = startingCash + dailyData[dateKey].income - dailyData[dateKey].spend;
          
          fullMonthData.push({
            ...dailyData[dateKey],
            cash: startingCash
          });
        } else {
          // Add empty data for days with no transactions but maintain cash balance
          fullMonthData.push({
            name: dateKey,
            income: 0,
            spend: 0,
            cash: startingCash,
            date: new Date(year, monthIndex, day)
          });
        }
      }
      
      // Sort by day
      return fullMonthData.sort((a, b) => a.date.getTime() - b.date.getTime());
    }
  }, [transactions, selectedMonth]);

  // Get unique months for the buttons
  const months = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    const uniqueMonths = new Map<string, string>();
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;
      uniqueMonths.set(monthYear, monthYear);
    });

    // Convert to array and sort chronologically
    return Array.from(uniqueMonths.values()).sort((a, b) => {
      const aDate = new Date(a);
      const bDate = new Date(b);
      return aDate.getTime() - bDate.getTime();
    });
  }, [transactions]);

  // Filter months to show only the past 12 months
  const recentMonths = useMemo(() => {
    if (months.length <= 12) {
      return months;
    }
    // Get the most recent 12 months
    return months.slice(Math.max(0, months.length - 12));
  }, [months]);

  const handleMonthClick = (month: string) => {
    setSelectedMonth(prev => prev === month ? null : month);
  };

  return loading ? (
    <SkeletonCharts />
  ) : (
    <StyledMyBalanceChart>
      <div className="header">
        <div className="month-buttons">
          <button
            className={`month-button ${!selectedMonth ? 'active' : ''}`}
            onClick={() => setSelectedMonth(null)}
          >
            All Months
          </button>
          {recentMonths.map(month => (
            <button
              key={month}
              className={`month-button ${selectedMonth === month ? 'active' : ''}`}
              onClick={() => handleMonthClick(month)}
            >
              {month}
            </button>
          ))}
        </div>
      </div>
      <div className="chart">
        <ResponsiveContainer width="99%" height="100%">
          <AreaChart
            data={chartData}
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
              interval={selectedMonth ? 'preserveStartEnd' : 0}
              tickFormatter={(value) => {
                if (selectedMonth) {
                  // For single month view, just show the day
                  return value.split(' ')[1];
                }
                return value;
              }}
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
              labelFormatter={(label) => {
                // Show full date in tooltip
                return selectedMonth ? `${label} (${selectedMonth})` : label;
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
      </div>
      <div className="legends">
        <span className="income">
          <span></span>
          Income
        </span>
        <span className="spend">
          <span></span>
          Spend
        </span>
        <span className="cash">
          <span></span>
          Cash on Hand
        </span>
      </div>
    </StyledMyBalanceChart>
  );
};

export default MyBalanceChart;
