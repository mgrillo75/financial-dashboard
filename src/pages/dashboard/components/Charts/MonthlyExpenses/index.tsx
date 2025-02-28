import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { StyledMonthlyExpensesChart } from './style';
// import { dataMonthlyExpenses } from '../../../../../mock/dashboard';
import { useDashboardContext } from '../../../../../hooks/useDashboardContext';
import SkeletonCharts from '../../../../../components/Layout/Skeleton/components/SkeletonCharts';
import { useMemo } from 'react';

interface CategoryColor {
  fill: string;
  stroke: string;
}

interface CategoryColors {
  [category: string]: CategoryColor;
}

interface ExpenseData {
  name: string;
  value: number;
  fill: string;
  stroke: string;
}

// Colors for different categories
const categoryColors: CategoryColors = {
  'Restaurant': {fill: 'rgb(65 255 198 / 34%)', stroke: 'rgb(65, 255, 198)'},
  'Shopping': {fill: 'rgb(255 233 54 / 20%)', stroke: 'rgb(255 237 94)'},
  'Entertainment': {fill: 'rgb(87 43 173 / 19%)', stroke: 'rgb(160 111 255)'},
  'Fee': {fill: 'rgb(248 86 64 / 47%)', stroke: 'rgb(255 103 82)'},
  'Transportation': {fill: 'rgb(0 183 255 / 23%)', stroke: 'rgb(0, 183, 255)'},
  'Utility': {fill: 'rgb(255 122 0 / 19%)', stroke: 'rgb(255, 122, 0)'},
  'Cryptocurrency': {fill: 'rgb(252 186 3 / 30%)', stroke: 'rgb(252, 186, 3)'},
  'Coffee Shop': {fill: 'rgb(130 87 34 / 30%)', stroke: 'rgb(130, 87, 34)'},
  'Housing': {fill: 'rgb(196 43 28 / 30%)', stroke: 'rgb(196, 43, 28)'},
  'Subscription': {fill: 'rgb(43 145 175 / 30%)', stroke: 'rgb(43, 145, 175)'},
  'Fuel': {fill: 'rgb(175 43 133 / 30%)', stroke: 'rgb(175, 43, 133)'},
  'Parking': {fill: 'rgb(112 128 144 / 30%)', stroke: 'rgb(112, 128, 144)'},
  'Uncategorized': {fill: 'rgb(128 128 128 / 30%)', stroke: 'rgb(128, 128, 128)'}
};

// Format number with commas
const formatCurrency = (value: number | string): string => {
  if (value === null || value === undefined) return '0';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return numValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

const MonthlyExpensesChart = () => {
  const { loading, monthlySpending, transactions } = useDashboardContext();

  // Calculate monthly expenses by category
  const expensesData = useMemo(() => {
    if (!monthlySpending || Object.keys(monthlySpending).length === 0) {
      // Fallback: Calculate from transactions if monthlySpending is not available
      if (transactions && transactions.length > 0) {
        const categoryTotals: Record<string, number> = {};
        
        // Only consider expenses (negative amounts)
        transactions
          .filter(t => t.amount < 0)
          .forEach(transaction => {
            const category = transaction.category || 'Uncategorized';
            if (!categoryTotals[category]) {
              categoryTotals[category] = 0;
            }
            categoryTotals[category] += Math.abs(transaction.amount);
          });
          
        return Object.entries(categoryTotals)
          .map(([name, value]) => ({
            name,
            value: Math.round(Number(value)),
            ...(categoryColors[name] || categoryColors['Uncategorized'])
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6); // Show top 6 categories
      }
      return [];
    }
    
    // Use the most recent month's data
    const months = Object.keys(monthlySpending).sort().reverse();
    if (months.length === 0) return [];
    
    const latestMonth = months[0];
    const categoryData = monthlySpending[latestMonth];
    
    return Object.entries(categoryData)
      .map(([name, value]) => ({
        name,
        value: Math.round(Number(value)),
        ...(categoryColors[name] || categoryColors['Uncategorized'])
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Show top 6 categories
  }, [monthlySpending, transactions]);

  const renderLegend = () => {
    return (
      <ul>
        {expensesData.map((entry, index) => (
          <li key={`item-${index}`}>
            <div>
              <span
                className="legend-icon"
                style={{ backgroundColor: entry.stroke }}
              />
              {` $${formatCurrency(entry.value)}`}
            </div>
            <span className="expense-name">{`${entry.name}`}</span>
          </li>
        ))}
      </ul>
    );
  };

  return loading ? (
    <SkeletonCharts type='circle' />
  ) : (
    <StyledMonthlyExpensesChart>
      <h3>Monthly Expenses</h3>

      <div className="chart">
        <ResponsiveContainer width="99%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: 'transparent',
                borderRadius: '8px',
                border: 0,
                backdropFilter: 'blur(3px)',
                textTransform: 'capitalize',
              }}
              itemStyle={{
                color: '#FFF',
                backgroundColor: '#25253490',
                border: '1px solid #373755',
                borderRadius: '8px',
                padding: '0.5rem 0',
                textAlign: 'center',
              }}
              formatter={(value) => {
                return [`$${formatCurrency(value as number)}`, null];
              }}
            />
            <Legend layout="radial" height={140} content={renderLegend} />
            <Pie
              data={expensesData}
              dataKey="value"
              cx="50%"
              cy="50%"
              nameKey="name"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </StyledMonthlyExpensesChart>
  );
};

export default MonthlyExpensesChart;
