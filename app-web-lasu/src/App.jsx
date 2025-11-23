import { useState } from 'react';

import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';

import { Dashboard } from './components/Dashboard'; 
import { Distritos } from './components/Distritos'; 
import { Usuarios } from './components/Usuarios'; 
import { Duenos } from './components/Duenos'; 
import { Clientes } from './components/Clientes'; 
import { Vendedores } from './components/Vendedores'; 
import { Categorias } from './components/Categorias'; 
import { Marcas } from './components/Marcas'; 
import { MetodosPago } from './components/MetodosPago'; 
import { Productos } from './components/Productos'; 
import { Compras } from './components/Compras'; 
import { Ventas } from './components/Ventas'; 
import { Pagos } from './components/Pagos'; 

export default function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('isAuthenticated') === 'true'
  );

  const [activeSection, setActiveSection] = useState(
    sessionStorage.getItem('activeSection') || 'dashboard'
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'distritos':
        return <Distritos />;
      case 'usuarios':
        return <Usuarios />;
      case 'duenos':
        return <Duenos />;
      case 'clientes':
        return <Clientes />;
      case 'vendedores':
        return <Vendedores />;
      case 'categorias':
        return <Categorias />;
      case 'marcas':
        return <Marcas />;
      case 'metodos-pago':
        return <MetodosPago />;
      case 'productos':
        return <Productos />;
      case 'compras':
        return <Compras />;
      case 'ventas':
        return <Ventas />;
      case 'pagos':
        return <Pagos />;
      default:
        return <Dashboard />;
    }
  };


  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('isAuthenticated', 'true');

    handleSectionChange('dashboard'); 
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('activeSection');
  };

  const handleSectionChange = (sectionName) => {
    setActiveSection(sectionName);
    sessionStorage.setItem('activeSection', sectionName);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={handleSectionChange} 
        onLogout={handleLogout}               
      />
      <main className="flex-1 ml-64 p-8">
        {renderSection()}
      </main>
    </div>
  );
}