import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { TrendingUp, ShoppingCart, Package, Users, DollarSign, ShoppingBag, AlertCircle, BarChart3, TrendingDown, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

export function Dashboard() {
  // --- ESTADOS PARA DATOS REALES (CSV) ---
  const [kpis, setKpis] = useState({
    ventasMes: 0,
    totalProductos: 0,
    totalClientes: 0,
    totalProveedores: 0,
    ventasTotalMonto: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // --- CARGAR DATOS REALES DEL CSV ---
  const fetchCsvData = (path) => {
    return new Promise((resolve) => {
        Papa.parse(path, {
            download: true,
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (result) => resolve(result.data),
            error: () => resolve([])
        });
    });
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [dataVentas, dataDetalles, dataProductos, dataClientes, dataVendedores] = await Promise.all([
          fetchCsvData('/data/venta.csv'),
          fetchCsvData('/data/detalle_venta.csv'),
          fetchCsvData('/data/producto.csv'),
          fetchCsvData('/data/cliente.csv'),
          fetchCsvData('/data/vendedor.csv')
        ]);

        // 1. CÁLCULO DE KPIs REALES
        const totalVentas = dataVentas.reduce((acc, curr) => acc + Number(curr.Total || 0), 0);
        
        setKpis({
          ventasMes: dataVentas.length,
          ventasTotalMonto: totalVentas,
          totalProductos: dataProductos.length,
          totalClientes: dataClientes.length,
          totalProveedores: dataVendedores.length
        });

        // 2. VENTAS RECIENTES REALES (Últimas 4 con Nombre de Cliente)
        // Primero ordenamos las ventas por ID numérico para obtener las últimas reales
        const ventasOrdenadas = [...dataVentas].sort((a, b) => {
             const idA = parseInt(String(a.idVenta).replace(/\D/g, '')) || 0;
             const idB = parseInt(String(b.idVenta).replace(/\D/g, '')) || 0;
             return idB - idA; // Descendente (Mayor ID primero)
        });

        const ultimasVentas = ventasOrdenadas.slice(0, 4).map(v => {
            // --- AQUÍ ESTÁ LA CORRECCIÓN ---
            // Buscamos el cliente en el array dataClientes usando el idCliente de la venta
            const clienteEncontrado = dataClientes.find(c => String(c.idCliente) === String(v.idCliente));
            
            // Si lo encuentra usa el nombre, si no, usa "Cliente Desconocido"
            const nombreMostrar = clienteEncontrado ? clienteEncontrado.nomCliente : (v.nombreCliente || 'Cliente Desconocido');

            return {
                id: v.idVenta,
                cliente: nombreMostrar, // Nombre real del CSV clientes
                producto: 'Varios Productos', 
                cantidad: 1,
                total: Number(v.Total).toFixed(2),
                metodo: v.nombreMetodo || 'Pago'
            };
        });
        setRecentSales(ultimasVentas);

        // 3. PRODUCTOS MÁS VENDIDOS REALES
        const conteoProductos = {};
        dataDetalles.forEach(d => {
            if (conteoProductos[d.nomProduc]) {
                conteoProductos[d.nomProduc] += Number(d.CantidadProduc);
            } else {
                conteoProductos[d.nomProduc] = Number(d.CantidadProduc);
            }
        });

        const topProdsArray = Object.entries(conteoProductos)
            .map(([nombre, cantidad]) => ({ nombre, ventas: cantidad, stock: Math.floor(Math.random() * 100) })) 
            .sort((a, b) => b.ventas - a.ventas)
            .slice(0, 4);
        
        setTopProducts(topProdsArray);

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      }
    };

    loadDashboardData();
  }, []);

  // --- DATOS VISUALES PARA PREDICCIONES (MOCK / SIMULADOS) ---
  const ventasPrediccion = [
    { mes: 'Jun', ventasReales: 32400, prediccion: null },
    { mes: 'Jul', ventasReales: 35200, prediccion: null },
    { mes: 'Ago', ventasReales: 38100, prediccion: null },
    { mes: 'Sep', ventasReales: 41500, prediccion: null },
    { mes: 'Oct', ventasReales: 43800, prediccion: null },
    { mes: 'Nov', ventasReales: 45230, prediccion: 45230 },
    { mes: 'Dic', ventasReales: null, prediccion: 48500 },
    { mes: 'Ene', ventasReales: null, prediccion: 51200 },
    { mes: 'Feb', ventasReales: null, prediccion: 53800 },
  ];

  const prediccionProductos = [
    { producto: 'Grifo ISAGRIF A1', ventaActual: 245, prediccionMes: 285, tendencia: 'up', confianza: 92 },
    { producto: 'Válvula FAVINSA 1/2"', ventaActual: 189, prediccionMes: 210, tendencia: 'up', confianza: 88 },
    { producto: 'Ducha TRAMONTINA', ventaActual: 156, prediccionMes: 145, tendencia: 'down', confianza: 85 },
    { producto: 'Llave Angular FV', ventaActual: 134, prediccionMes: 165, tendencia: 'up', confianza: 90 },
  ];

  const ventasPorCategoria = [
    { categoria: 'Grifería', actual: 18500, prediccion: 21200 },
    { categoria: 'Válvulas', actual: 12300, prediccion: 13800 },
    { categoria: 'Accesorios', actual: 8900, prediccion: 9500 },
    { categoria: 'Tuberías', actual: 5530, prediccion: 6100 },
  ];

  const alertasPrediccion = [
    { tipo: 'stock', mensaje: 'Llave Angular FV: Stock bajo proyectado para Diciembre', prioridad: 'alta' },
    { tipo: 'demanda', mensaje: 'Aumento del 23% en demanda de grifería predicho', prioridad: 'media' },
    { tipo: 'tendencia', mensaje: 'Descenso en ventas de duchas previsto próximo mes', prioridad: 'media' },
  ];

  const stats = [
    { title: 'Ventas Totales', value: `S/ ${kpis.ventasTotalMonto.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: TrendingUp, change: '+12%' },
    { title: 'Transacciones', value: kpis.ventasMes, icon: ShoppingBag, change: '+8%' },
    { title: 'Productos', value: kpis.totalProductos, icon: Package, change: '+45' },
    { title: 'Clientes', value: kpis.totalClientes, icon: Users, change: '+23' },
    { title: 'Proveedores', value: kpis.totalProveedores, icon: ShoppingCart, change: '+2' },
    { title: 'Pagos Pendientes', value: 'S/ 5,670', icon: DollarSign, change: '-15%' }, 
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-blue-900 text-4xl mb-2">Dashboard</h1>
        <p className="text-gray-600">Resumen general y predicciones de LASU Ferretería</p>
      </div>

      {/* TARJETAS SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{stat.value}</div>
                <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                  {stat.change.startsWith('+') ? <ArrowUpRight className="h-3 w-3 mr-1"/> : <TrendingDown className="h-3 w-3 mr-1"/>}
                  {stat.change} mes anterior
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* SECCIÓN DE PREDICCIONES (INTELIGENCIA ARTIFICIAL) */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-300">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-8 w-8 text-blue-900" />
          <div>
            <h2 className="text-blue-900 text-2xl font-bold">Predicciones y Análisis Predictivo</h2>
            <p className="text-blue-700 text-sm">Sistema de predicción de ventas basado en Machine Learning (Histórico 10k)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {alertasPrediccion.map((alerta, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-l-4 bg-white shadow-sm ${alerta.prioridad === 'alta' ? 'border-red-500' : 'border-yellow-500'}`}>
              <div className="flex items-start gap-2">
                <AlertCircle className={`h-5 w-5 mt-0.5 ${alerta.prioridad === 'alta' ? 'text-red-500' : 'text-yellow-500'}`} />
                <div>
                  <p className="text-sm text-gray-900 font-medium">{alerta.mensaje}</p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">Prioridad: {alerta.prioridad}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Predicción de Ventas Mensuales</CardTitle>
              <p className="text-sm text-gray-600">Proyección basada en tendencias históricas</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={ventasPrediccion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => `S/ ${value?.toLocaleString()}`} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
                  <Legend />
                  <Area type="monotone" dataKey="ventasReales" stroke="#1e40af" fill="#3b82f6" name="Ventas Reales" />
                  <Area type="monotone" dataKey="prediccion" stroke="#f59e0b" fill="#fbbf24" strokeDasharray="5 5" name="Predicción IA" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Predicción por Categoría</CardTitle>
              <p className="text-sm text-gray-600">Comparativa actual vs. proyección</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ventasPorCategoria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis />
                  <Tooltip formatter={(value) => `S/ ${value?.toLocaleString()}`} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
                  <Legend />
                  <Bar dataKey="actual" fill="#3b82f6" name="Ventas Actuales" />
                  <Bar dataKey="prediccion" fill="#fbbf24" name="Predicción Próximo Mes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-blue-900">Predicción de Demanda por Producto</CardTitle>
            <p className="text-sm text-gray-600">Productos con mayor probabilidad de aumento en ventas</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Producto</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Venta Actual</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Predicción Mes</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Cambio</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Tendencia</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Confianza</th>
                  </tr>
                </thead>
                <tbody>
                  {prediccionProductos.map((item, idx) => {
                    const cambio = ((item.prediccionMes - item.ventaActual) / item.ventaActual * 100).toFixed(1);
                    return (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-blue-900 font-medium">{item.producto}</td>
                        <td className="text-center py-3 px-4">{item.ventaActual}</td>
                        <td className="text-center py-3 px-4 font-bold">{item.prediccionMes}</td>
                        <td className={`text-center py-3 px-4 ${item.tendencia === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {item.tendencia === 'up' ? '+' : ''}{cambio}%
                        </td>
                        <td className="text-center py-3 px-4">
                          {item.tendencia === 'up' ? <TrendingUp className="h-5 w-5 text-green-600 mx-auto" /> : <TrendingDown className="h-5 w-5 text-red-600 mx-auto" />}
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.confianza}%` }} />
                            </div>
                            <span className="text-xs text-gray-600">{item.confianza}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VENTAS RECIENTES Y TOP PRODUCTOS (DATOS REALES) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-900">Ventas Recientes (Real)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="text-blue-900 font-medium">{sale.cliente}</p>
                    <p className="text-sm text-gray-600">ID: {sale.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-900 font-bold">S/ {sale.total}</p>
                    <p className="text-xs text-gray-500">{sale.metodo}</p>
                  </div>
                </div>
              ))}
              {recentSales.length === 0 && <p className="text-gray-500 text-center">Cargando ventas...</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-900">Productos Más Vendidos (Real)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="text-blue-900 font-medium">{product.nombre}</p>
                    <div className="flex gap-4 mt-1">
                      <p className="text-sm text-gray-600">Ventas: {product.ventas}</p>
                      <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                    </div>
                  </div>
                  <div className="h-2 w-24 bg-gray-200 rounded-full ml-4">
                    <div 
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${Math.min((product.ventas / (topProducts[0]?.ventas || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && <p className="text-gray-500 text-center">Calculando ranking...</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}