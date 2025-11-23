import { useState } from 'react';

// Componentes de la App
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';

// Componentes de las Secciones
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

  // --- CAMBIO 1: Leer el estado desde sessionStorage ---
  // Al cargar, comprueba si ya estábamos autenticados en esta pestaña
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('isAuthenticated') === 'true'
  );

  // --- CAMBIO 2: Leer la sección activa desde sessionStorage ---
  // Carga la última sección visitada, o 'dashboard' si es la primera vez
  const [activeSection, setActiveSection] = useState(
    sessionStorage.getItem('activeSection') || 'dashboard'
  );

  // --- (Sin cambios) ---
  // Esta función decide qué componente mostrar en el <main>
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

  // --- CAMBIO 3: Guardar el estado en sessionStorage ---
  // Cuando el login es exitoso, actualiza el estado Y sessionStorage
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('isAuthenticated', 'true');
    // (Opcional) Al loguear, siempre ir al dashboard
    handleSectionChange('dashboard'); 
  };

  // --- CAMBIO 4: Nueva función de Logout ---
  // Limpia el estado Y sessionStorage
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('activeSection');
  };

  // --- CAMBIO 5: Nueva función "wrapper" para la sección ---
  // Esta función actualiza el estado Y sessionStorage cada vez
  // que el usuario cambia de sección en el Sidebar.
  const handleSectionChange = (sectionName) => {
    setActiveSection(sectionName);
    sessionStorage.setItem('activeSection', sectionName);
  };

  // --- (Sin cambios) ---
  // Si NO está autenticado, muestra el componente Login
  if (!isAuthenticated) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  // --- CAMBIO 6: Pasar las nuevas props al Sidebar ---
  // Si SÍ está autenticado, muestra la app principal
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={handleSectionChange} // <--- Pasamos la nueva función
        onLogout={handleLogout}                // <--- Pasamos la función de logout
      />
      <main className="flex-1 ml-64 p-8">
        {renderSection()}
      </main>
    </div>
  );
}