import { createContext, ReactNode, useEffect, useState } from 'react';
import { api } from '../services/api';
import { iDataCard } from '../types/Cards';

interface Transaction {
  id: string;
  postedDate: string;
  date: string;
  transactionDate: string;
  type: string;
  description: string;
  amount: number;
  isDebit: boolean;
  category: string;
  cardId: string;
}

interface BalanceHistoryItem {
  date: string;
  balance: string;
}

interface MonthlySpending {
  [month: string]: {
    [category: string]: number;
  };
}

interface iDashboardContext {
  cards: iDataCard[];
  transactions: Transaction[];
  balanceHistory: BalanceHistoryItem[];
  monthlySpending: MonthlySpending;
  recentActivity: Transaction[];
  loading: boolean;
  getCards: () => void;
  createCard: (data: iDataCard) => void;
  handleShowModal: () => void;
  isOpen: boolean;
}

export const DashboardContext = createContext({} as iDashboardContext);

export const DashboardContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [cards, setCards] = useState<iDataCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistoryItem[]>([]);
  const [monthlySpending, setMonthlySpending] = useState<MonthlySpending>({});
  const [recentActivity, setRecentActivity] = useState<Transaction[]>([]);

  const handleShowModal = () => {
    setIsOpen(!isOpen)
  }

  const getCards = async () => {
    try {
      setLoading(true);
      
      // Fetch cards from API
      const cardsRes = await api.get('cards');
      setCards(cardsRes.data);
      
      // Fetch transactions from API
      const transactionsRes = await api.get('transactions');
      setTransactions(transactionsRes.data);
      
      // Fetch balance history from API
      const balanceHistoryRes = await api.get('balanceHistory');
      setBalanceHistory(balanceHistoryRes.data);
      
      // Fetch monthly spending from API
      const monthlySpendingRes = await api.get('monthlySpending');
      setMonthlySpending(monthlySpendingRes.data);
      
      // Fetch recent activity from API
      const recentActivityRes = await api.get('recentActivity');
      setRecentActivity(recentActivityRes.data);
      
    } catch (error) {
      console.error('Error while fetching data:', error);
      
      // Fallback to localStorage for cards if API fails
      try {
        const storagedCards = JSON.parse(localStorage.getItem('cards') || '[]');
        setCards(storagedCards);
      } catch (err) {
        console.error('Error loading from localStorage:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const createCard = async (data: iDataCard) => {
    try {
      setLoading(true);
      
      // Send new card to API
      await api.post('cards', data);
      
      // Refresh data
      getCards();
    } catch (error) {
      console.error('Error while creating card:', error);
      
      // Fallback to localStorage if API fails
      try {
        const updatedCards = [...cards, data];
        setCards(updatedCards);
        localStorage.setItem('cards', JSON.stringify(updatedCards));
      } catch (err) {
        console.error('Error saving to localStorage:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load data on component mount
    getCards();
  }, []);

  return (
    <DashboardContext.Provider 
      value={{ 
        cards, 
        transactions, 
        balanceHistory, 
        monthlySpending, 
        recentActivity,
        loading, 
        getCards, 
        createCard, 
        isOpen, 
        handleShowModal 
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
