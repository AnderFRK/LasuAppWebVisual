import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  Crown, 
  UserCircle, 
  ShoppingCart, 
  Layers, 
  Tag, 
  CreditCard, 
  Package, 
  ShoppingBag, 
  TrendingUp,
  DollarSign,
  LogOut
} from 'lucide-react';
import logoLASU from '../assets/LASU-BLUE2.png';

export function Sidebar({ activeSection, setActiveSection, onLogout }) {
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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-blue-900 text-white flex flex-col">
      
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
                onClick={() => setActiveSection(item.id)}
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
  );
}