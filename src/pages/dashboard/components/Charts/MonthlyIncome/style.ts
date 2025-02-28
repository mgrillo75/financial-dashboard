import styled from 'styled-components';
import { breakpoints } from '../../../../../constants/breakpoints';

export const StyledMonthlyIncomeChart = styled.div`
  width: 33.33%;
  height: 280px;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.componentBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .chart {
    width: 100%;
    height: 100%;
    position: relative;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: absolute;
    left: 0;
    top: 20%;
    max-width: 190px;
    z-index: 10;

    li {
      display: flex;
      flex-direction: row;
      align-items: center;
      font-size: 0.85rem;
    }
    
    li div {
      display: flex;
      align-items: center;
      min-width: 95px;
      font-weight: 500;
    }
    
    li div span:nth-of-type(1) {
      margin-right: 0.5rem;
    }

    .expense-name {
      text-align: left;
      font-size: 0.8rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 95px;
    }
  }

  .recharts-pie {
    transform: translateX(110px) translateY(-10px);
  }

  .legend-icon {
    width: 12px;
    height: 12px;
    display: inline-block;
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .expense-name {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.gray};
  }

  h3 {
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }

  @media ${breakpoints.md} {
    .recharts-responsive-container {
      position: relative;
      right: 0;
    }

    .recharts-pie {
      transform: translateX(0);
    }

    .chart {
      width: 100%;
    }

    ul {
      position: static;
      transform: none;
      max-width: none;
      margin-bottom: 1rem;
      margin-top: 0;
    }

    li div {
      min-width: auto;
    }

    ul li {
      gap: 0.5rem;
      font-size: 0.8rem;
    }

    width: 100%;
  }
`; 