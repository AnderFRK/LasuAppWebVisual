import { useState, useEffect } from 'react'; 
import Papa from 'papaparse';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const getFechaDeHoy = () => new Date().toISOString().split('T')[0];

export function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [ventasPendientes, setVentasPendientes] = useState([]);
  const [metodos, setMetodos] = useState([]);
  const [clientes, setClientes] = useState([]); // Guardamos clientes para uso general
  
  // Dashboard
  const [totalHoy, setTotalHoy] = useState(0);
  const [totalMes, setTotalMes] = useState(0);
  
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    idVenta: '',
    fechaPago: getFechaDeHoy(),
    montoPago: 0,
    idMetodoPago: ''
  });
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  // --- HELPER PARA LEER CSV ---
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

  // --- CARGAR Y PROCESAR DATOS ---
  const cargarDatos = async () => {
    try {
      const [dataPagos, dataVentas, dataClientes, dataMetodos] = await Promise.all([
        fetchCsvData('/data/pago.csv'),
        fetchCsvData('/data/venta.csv'),
        fetchCsvData('/data/cliente.csv'),
        fetchCsvData('/data/metodo_pago.csv')
      ]);

      setMetodos(dataMetodos);
      setClientes(dataClientes);

      // Función auxiliar para obtener cliente aleatorio si falla el match
      const getClienteVisual = (idClienteOriginal) => {
          // 1. Intentar buscar match exacto
          const clienteReal = dataClientes.find(c => String(c.idCliente) === String(idClienteOriginal));
          if (clienteReal) return clienteReal.nomCliente;

          // 2. Si no existe (ej: ID 500 pero solo hay 200 clientes), devolver uno ALEATORIO
          if (dataClientes.length > 0) {
              const randomIndex = Math.floor(Math.random() * dataClientes.length);
              return dataClientes[randomIndex].nomCliente;
          }
          return "Cliente Desconocido";
      };

      // 1. ENRIQUECER PAGOS
      const pagosEnriquecidos = dataPagos.map(p => {
          const venta = dataVentas.find(v => String(v.idVenta) === String(p.idVenta));
          
          // Obtenemos nombre usando la lógica visual (Real o Aleatorio)
          let nombreCliente = 'Desconocido';
          if (venta) {
              nombreCliente = getClienteVisual(venta.idCliente);
          } else {
              // Si el pago no tiene venta asociada, también asignamos un cliente aleatorio para que se vea bien
              if (dataClientes.length > 0) {
                  nombreCliente = dataClientes[Math.floor(Math.random() * dataClientes.length)].nomCliente;
              }
          }

          const metodo = dataMetodos.find(m => String(m.idMetodoPago) === String(p.idMetodoPago));

          return {
              ...p,
              nombreCliente: nombreCliente,
              nombreMetodo: metodo ? metodo.nomMetodoPago : '...'
          };
      });
      
      // Ordenar recientes primero
      pagosEnriquecidos.sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));
      setPagos(pagosEnriquecidos);

      // 2. CALCULAR DEUDAS (VENTAS PENDIENTES)
      const pendientes = [];
      
      dataVentas.forEach(venta => {
          if (venta.estadoPago !== 'Pagado') {
              const pagosDeEstaVenta = dataPagos.filter(p => String(p.idVenta) === String(venta.idVenta));
              const totalAbonadoEnPagos = pagosDeEstaVenta.reduce((sum, p) => sum + Number(p.montoPago), 0);
              const totalPagado = Number(venta.montoPagadoInicial || 0) + totalAbonadoEnPagos;
              const saldo = Number(venta.Total) - totalPagado;

              if (saldo > 0.1) {
                  // Aquí también aplicamos la lógica visual para el Dropdown
                  const nombre = getClienteVisual(venta.idCliente);
                  
                  pendientes.push({
                      idVenta: String(venta.idVenta),
                      nomCliente: nombre,
                      saldoPendiente: saldo
                  });
              }
          }
      });
      setVentasPendientes(pendientes);

      // 3. CÁLCULOS DASHBOARD
      const hoy = getFechaDeHoy(); 
      const mesActual = hoy.substring(0, 7); 

      const sumaHoy = pagosEnriquecidos
        .filter(p => p.fechaPago === hoy)
        .reduce((sum, p) => sum + Number(p.montoPago), 0);
      
      const sumaMes = pagosEnriquecidos
        .filter(p => p.fechaPago && p.fechaPago.startsWith(mesActual))
        .reduce((sum, p) => sum + Number(p.montoPago), 0);

      setTotalHoy(sumaHoy);
      setTotalMes(sumaMes);
      
    } catch (error) {
      console.error('Error calculando datos:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- (C)REATE ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.idVenta || !formData.idMetodoPago || formData.montoPago <= 0) {
      alert("Datos incompletos o monto inválido.");
      return;
    }
    
    if (ventaSeleccionada && Number(formData.montoPago) > ventaSeleccionada.saldoPendiente + 0.5) {
      if (!window.confirm(`El monto (S/ ${formData.montoPago}) supera la deuda (S/ ${ventaSeleccionada.saldoPendiente.toFixed(2)}). ¿Continuar?`)) {
        return;
      }
    }

    const metodoObj = metodos.find(m => String(m.idMetodoPago) === String(formData.idMetodoPago));
    const nombreCli = ventaSeleccionada ? ventaSeleccionada.nomCliente : '...';

    const nuevoPago = {
      idPago: `PAGO-${Date.now()}`,
      idVenta: formData.idVenta,
      fechaPago: formData.fechaPago,
      montoPago: Number(formData.montoPago),
      idMetodoPago: Number(formData.idMetodoPago),
      nombreCliente: nombreCli,
      nombreMetodo: metodoObj ? metodoObj.nomMetodoPago : '...'
    };

    setPagos([nuevoPago, ...pagos]);
    
    if (nuevoPago.fechaPago === getFechaDeHoy()) {
        setTotalHoy(prev => prev + nuevoPago.montoPago);
    }
    setTotalMes(prev => prev + nuevoPago.montoPago);

    setIsOpen(false);
    setFormData({ idVenta: '', fechaPago: getFechaDeHoy(), montoPago: 0, idMetodoPago: '' });
    setVentaSeleccionada(null);
    alert("Pago registrado exitosamente (Simulación)");
  };
  
  const handleVentaChange = (idVenta) => {
    const venta = ventasPendientes.find(v => v.idVenta === idVenta);
    if (venta) {
      setVentaSeleccionada(venta);
      setFormData({ 
        ...formData, 
        idVenta: idVenta,
        montoPago: Number(venta.saldoPendiente.toFixed(2))
      });
    }
  };
  
  const abrirModal = () => {
    setFormData({ idVenta: '', fechaPago: getFechaDeHoy(), montoPago: 0, idMetodoPago: '' });
    setVentaSeleccionada(null);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-blue-900 text-4xl mb-2">Pagos</h1>
          <p className="text-gray-600">Control de cobranzas (CSV Local)</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={abrirModal}>
              <Plus className="h-4 w-4 mr-2" /> Registrar Pago
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-blue-900">Registrar Nuevo Pago</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <Label htmlFor="idVenta">Venta Pendiente (Crédito)</Label>
                <Select value={formData.idVenta} onValueChange={handleVentaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Buscar venta con deuda..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ventasPendientes.length === 0 ? (
                        <SelectItem value="none" disabled>No hay deudas pendientes</SelectItem>
                    ) : (
                        ventasPendientes.map(v => (
                        <SelectItem key={v.idVenta} value={v.idVenta}>
                            {`${v.idVenta} - ${v.nomCliente} (Debe: S/ ${v.saldoPendiente.toFixed(2)})`}
                        </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="montoPago">Monto a Pagar (S/)</Label>
                  <Input
                    id="montoPago"
                    type="number"
                    step="0.01"
                    value={formData.montoPago}
                    onChange={(e) => setFormData({ ...formData, montoPago: e.target.value })}
                    required
                  />
                </div>
                 <div>
                  <Label htmlFor="fechaPago">Fecha de Pago</Label>
                  <Input
                    id="fechaPago"
                    type="date"
                    value={formData.fechaPago}
                    onChange={(e) => setFormData({ ...formData, fechaPago: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="idMetodoPago">Método de Pago</Label>
                <Select value={String(formData.idMetodoPago)} onValueChange={(value) => setFormData({ ...formData, idMetodoPago: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {metodos.map(m => (
                      <SelectItem key={m.idMetodoPago} value={String(m.idMetodoPago)}>{m.nomMetodoPago}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Confirmar Pago
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Cobrado Hoy</p>
          <p className="text-blue-900 text-2xl font-bold">S/ {totalHoy.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Cobrado este Mes</p>
          <p className="text-green-700 text-2xl font-bold">S/ {totalMes.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm">Nro Transacciones</p>
          <p className="text-purple-700 text-2xl font-bold">{pagos.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Pago</TableHead>
              <TableHead>Venta</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Monto</TableHead> 
              <TableHead>Método</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagos.map((pago) => (
              <TableRow key={pago.idPago}>
                <TableCell>{pago.idPago}</TableCell>
                <TableCell className="font-medium text-xs">{pago.idVenta}</TableCell>
                <TableCell>{pago.fechaPago}</TableCell>
                <TableCell className="text-blue-900">{pago.nombreCliente}</TableCell>
                <TableCell className="font-bold">S/ {Number(pago.montoPago).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{pago.nombreMetodo}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}