import { useState, useEffect } from 'react';
import { format, subMonths, isAfter } from 'date-fns';

const GraphComponent = () => {
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const currentDate = new Date();
    const twelveMonthsAgo = subMonths(currentDate, 12);

    const recentData = data.filter(item => {
      const itemDate = new Date(item.date);
      return isAfter(itemDate, twelveMonthsAgo);
    });

    setFilteredData(recentData);
  }, [data]);

  return (
    <div>
      {filteredData.map(item => (
        <button key={item.date}>{format(new Date(item.date), 'MMM yyyy')}</button>
      ))}
    </div>
  );
};

export default GraphComponent; 