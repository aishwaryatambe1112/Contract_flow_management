import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BlueprintList from './components/blueprints/BlueprintList';
import BlueprintForm from './components/blueprints/BlueprintForm';
import ContractCreate from './components/contracts/ContractCreate';
import ContractView from './components/contracts/ContractView';

function AppContent() {
  const { currentView } = useApp();

  function renderView() {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'blueprints':
        return <BlueprintList />;
      case 'blueprint-create':
      case 'blueprint-edit':
        return <BlueprintForm />;
      case 'contract-create':
        return <ContractCreate />;
      case 'contract-view':
        return <ContractView />;
      default:
        return <Dashboard />;
    }
  }

  return <Layout>{renderView()}</Layout>;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
