import { createContext, useContext, useState, ReactNode } from 'react';

type View = 'dashboard' | 'blueprints' | 'blueprint-create' | 'blueprint-edit' | 'contract-create' | 'contract-view';

interface AppContextType {
  currentView: View;
  setCurrentView: (view: View) => void;
  selectedBlueprintId: string | null;
  setSelectedBlueprintId: (id: string | null) => void;
  selectedContractId: string | null;
  setSelectedContractId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedBlueprintId,
        setSelectedBlueprintId,
        selectedContractId,
        setSelectedContractId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
