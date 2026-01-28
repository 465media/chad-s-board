import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

interface BotTokenContextType {
  token: string | null;
  isBot: boolean;
}

const BotTokenContext = createContext<BotTokenContextType>({
  token: null,
  isBot: false,
});

export const useBotToken = () => useContext(BotTokenContext);

interface BotTokenProviderProps {
  children: ReactNode;
}

export const BotTokenProvider: React.FC<BotTokenProviderProps> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  return (
    <BotTokenContext.Provider value={{ token, isBot: !!token }}>
      {children}
    </BotTokenContext.Provider>
  );
};
