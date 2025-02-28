import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { StyledMonthlyIncomeChart } from './style';
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

interface IncomeData {
  name: string;
  value: number;
  fill: string;
  stroke: string;
}

// Colors for different income categories
const categoryColors: CategoryColors = {
  'Income': {fill: 'rgb(65 255 198 / 34%)', stroke: 'rgb(65, 255, 198)'},
  'Cryptocurrency': {fill: 'rgb(252 186 3 / 30%)', stroke: 'rgb(252, 186, 3)'},
  'Transfer': {fill: 'rgb(87 43 173 / 19%)', stroke: 'rgb(160 111 255)'},
  'Professional Services': {fill: 'rgb(0 183 255 / 23%)', stroke: 'rgb(0, 183, 255)'},
  'Cash Deposit': {fill: 'rgb(248 86 64 / 47%)', stroke: 'rgb(255 103 82)'},
  'Refund': {fill: 'rgb(255 233 54 / 20%)', stroke: 'rgb(255 237 94)'},
  'Other': {fill: 'rgb(128 128 128 / 30%)', stroke: 'rgb(128, 128, 128)'}
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

const MonthlyIncomeChart = () => {
  const { loading, monthlySpending, transactions } = useDashboardContext();

  // Calculate monthly income by category
  const incomeData = useMemo(() => {
    // Calculate from transactions
    if (transactions && transactions.length > 0) {
      const categoryTotals: Record<string, number> = {};
      
      // Only consider income (positive amounts)
      transactions
        .filter(t => t.amount > 0)
        .forEach(transaction => {
          const category = transaction.category || 'Other';
          if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
          }
          categoryTotals[category] += transaction.amount;
        });
        
      return Object.entries(categoryTotals)
        .map(([name, value]) => ({
          name,
          value: Math.round(Number(value)),
          ...(categoryColors[name] || categoryColors['Other'])
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Show top 6 categories
    }
    return [];
  }, [transactions]);

  const renderLegend = () => {
    return (
      <ul>
        {incomeData.map((entry, index) => (
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
    <StyledMonthlyIncomeChart>
      <h3>Monthly Income</h3>

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
              data={incomeData}
              dataKey="value"
              cx="50%"
              cy="50%"
              nameKey="name"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </StyledMonthlyIncomeChart>
  );
};

export default MonthlyIncomeChart; 