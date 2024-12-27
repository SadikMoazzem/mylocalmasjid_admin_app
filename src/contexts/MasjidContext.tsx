import { createContext, useContext, ReactNode } from 'react';
import { useParams } from 'react-router-dom';

interface MasjidContextType {
  masjidId: string | undefined;
}

const MasjidContext = createContext<MasjidContextType | undefined>(undefined);

export function MasjidProvider({ children }: { children: ReactNode }) {
  const { masjidId } = useParams<{ masjidId: string }>();

  return (
    <MasjidContext.Provider value={{ masjidId }}>
      {children}
    </MasjidContext.Provider>
  );
}

export function useMasjid() {
  const context = useContext(MasjidContext);
  if (context === undefined) {
    throw new Error('useMasjid must be used within a MasjidProvider');
  }
  return context;
} 