import styled from 'styled-components';

export const StyledMyBalanceChart = styled.div`
  margin: 1.5rem 0;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: ${({theme}) => theme.colors.componentBackground};
  border: 1px solid ${({theme}) => theme.colors.border};

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1.5rem;
    position: relative;
  }

  .month-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: nowrap;
    max-width: 100%;
    overflow-x: auto;
    padding-bottom: 8px;
    
    /* Show a subtle scrollbar instead of hiding it */
    &::-webkit-scrollbar {
      height: 6px;
      display: block;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }
    
    /* For Firefox and other browsers */
    -ms-overflow-style: auto;  /* IE and Edge */
    scrollbar-width: thin;     /* Firefox */
  }

  .month-button {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    border: 1px solid rgba(255, 127, 0, 0.4);
    background: linear-gradient(to bottom, rgba(255, 145, 0, 0.8) 5%, rgba(204, 85, 0, 0.5) 95%);
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    box-shadow: 0 1px 3px rgba(255, 120, 0, 0.3);

    &:hover {
      background: linear-gradient(to bottom, rgba(255, 170, 0, 0.9) 5%, rgba(255, 100, 0, 0.7) 95%);
      border-color: rgba(255, 150, 0, 0.6);
      box-shadow: 0 1px 5px rgba(255, 120, 0, 0.5);
    }

    &.active {
      background: linear-gradient(to bottom, #5D2AC9 5%, #4A1B9E 95%);
      color: white;
      border-color: #6E3AD5;
      box-shadow: 0 1px 8px rgba(93, 42, 201, 0.5);
    }
  }

  .legends {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-left: auto;
    position: absolute;
    right: 0;
    z-index: 2;

    span {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
    }

    span span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
  }

  .chart {
    width: 100%;
    height: 300px;
  }

  .income {
    span {
      background-color: #54e0a5;
    }
  }

  .spend {
    span {
      background-color: #5d2ac9;
    }
  }
`;
