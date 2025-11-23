import { 
  LayoutDashboard, MapPin, Users, Crown, UserCircle, ShoppingCart, 
  Layers, Tag, CreditCard, Package, ShoppingBag, TrendingUp, 
  DollarSign, LogOut, Menu
} from 'lucide-react';
import logoLASU from '../assets/LASU-BLUE2.png';
import { useState } from "react";

export function Sidebar({ activeSection, setActiveSection, onLogout }) {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'distritos', label: 'Distritos', icon: MapPin },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'duenos', label: 'Dueños', icon: Crown },
    { id: 'clientes', label: 'Clientes', icon: UserCircle },
    { id: 'vendedores', label: 'Proveedores', icon: ShoppingCart },
    { id: 'categorias', label: 'Categorías', icon: Layers },
    { id: 'marcas', label: 'Marcas', icon: Tag },
    { id: 'metodos-pago', label: 'Métodos de Pago', icon: CreditCard },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'compras', label: 'Compras', icon: ShoppingBag },
    { id: 'ventas', label: 'Ventas', icon: TrendingUp },
    { id: 'pagos', label: 'Pagos', icon: DollarSign },
  ];

  return (
    <>
      {/* Botón solo visible en móvil */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-900 rounded-lg text-white"
        onClick={() => setOpen(!open)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay oscuro cuando el menú está abierto en móvil */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-blue-900 text-white flex flex-col z-50
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-center p-6 mb-4">
          <img 
            src={logoLASU} 
            alt="Logo Ferretería LASU" 
            className="h-16 w-auto" 
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 custom-sidebar-scroll">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setOpen(false); // cerrar menú en móvil
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-blue-800">
          <button
            onClick={onLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-blue-800 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
