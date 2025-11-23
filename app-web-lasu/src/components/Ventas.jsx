import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Plus, Eye, Trash2, XCircle, ShoppingCart, Pencil, FileDown, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import * as XLSX from 'xlsx';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { GuiaVentaPDF } from './GuiaVentaPDF';

const getFechaDeHoy = () => new Date().toISOString().split('T')[0];

export function Ventas() {
  const [ventas, setVentas] = useState([]); 
  const [allDetalles, setAllDetalles] = useState([]); 
  const [detalleVenta, setDetalleVenta] = useState([]);
  const [ventaActual, setVentaActual] = useState(null);
  
  // --- PAGINACIÓN ---
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(20); 
  
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVenta, setEditingVenta] = useState(null); 

  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  const metodosPago = [
    { idMetodoPago: 1, nomMetodoPago: 'Efectivo' },
    { idMetodoPago: 2, nomMetodoPago: 'Transferencia' },
    { idMetodoPago: 3, nomMetodoPago: 'Yape' },
    { idMetodoPago: 4, nomMetodoPago: 'Plin' }
  ];
  
  const [itemsVenta, setItemsVenta] = useState([]);
  const [formData, setFormData] = useState({
    idCliente: '',
    Fecha_Venta: getFechaDeHoy(),
    tipoVenta: 'Contado',
    montoPagadoInicial: 0,
    idMetodoPago: ''
  });
  const [itemActual, setItemActual] = useState('');
  const [cantidadActual, setCantidadActual] = useState(1);
  const [precioActual, setPrecioActual] = useState(0);

  // --- HELPER PARA LEER CSV (CORREGIDO PARA GITHUB PAGES) ---
  const fetchCsvData = (path) => {
    const relativePath = path.startsWith('/') ? path.slice(1) : path;
    const url = `${import.meta.env.BASE_URL}${relativePath}`;
    
    return new Promise((resolve) => {
        Papa.parse(url, {
            download: true,
            header: true,
            dynamicTyping: true, 
            skipEmptyLines: true,
            complete: (result) => resolve(result.data),
            error: (err) => {
                console.error("Error leyendo CSV:", err);
                resolve([]);
            }
        });
    });
  };

  // --- CARGAR DATOS ---
  const cargarDatos = async () => {
    try {
      const [dataVentas, dataClientes, dataProductos, dataDetalles] = await Promise.all([
        fetchCsvData('data/venta.csv'),
        fetchCsvData('data/cliente.csv'),
        fetchCsvData('data/producto.csv'),
        fetchCsvData('data/detalle_venta.csv')
      ]);

      setClientes(dataClientes);
      setProductos(dataProductos);
      setAllDetalles(dataDetalles);

      // Enriquecer datos (JOIN INTELIGENTE)
      const ventasEnriquecidas = dataVentas.map(v => {
          // 1. Intentamos buscar el cliente por ID
          const cliente = dataClientes.find(c => String(c.idCliente) === String(v.idCliente));
          
          // 2. Si el CSV de ventas ya trae el nombre, usamos ese. Si no, usamos el del cruce.
          const nombreFinal = v.nombreCliente || (cliente ? cliente.nomCliente : 'Cliente Desconocido');

          const metodo = metodosPago.find(m => String(m.idMetodoPago) === String(v.idMetodoPago));
          const nombreMetodoFinal = v.nombreMetodo || (metodo ? metodo.nomMetodoPago : 'Desconocido');
          
          return {
              ...v,
              idVenta: String(v.idVenta), // Convertir a string para evitar errores con .slice()
              nombreCliente: nombreFinal,
              nombreMetodo: nombreMetodoFinal
          };
      });

      // Ordenar por ID descendente (numérico)
      ventasEnriquecidas.sort((a, b) => {
          const idA = parseInt(String(a.idVenta).replace(/\D/g, '')) || 0;
          const idB = parseInt(String(b.idVenta).replace(/\D/g, '')) || 0;
          return idB - idA;
      });

      setVentas(ventasEnriquecidas);

    } catch (error) {
      console.error('Error al cargar datos CSV:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- LÓGICA PAGINACIÓN ---
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const ventasVisibles = ventas.slice(indicePrimerItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(ventas.length / itemsPorPagina);

  const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  // --- VER DETALLE ---
  const handleVerDetalle = (venta) => {
    setVentaActual(venta);
    const detallesDeEstaVenta = allDetalles.filter(d => String(d.idVenta) === String(venta.idVenta));
    const detallesConNombre = detallesDeEstaVenta.map(d => {
        const prod = productos.find(p => String(p.idProduc) === String(d.idProduc));
        return {
            ...d,
            nomProduc: prod ? prod.nomProduc : (d.nomProduc || 'Producto Eliminado')
        };
    });
    setDetalleVenta(detallesConNombre);
    setIsDetalleModalOpen(true);
  };

  // --- DELETE ---
  const handleDeleteVenta = (idVenta) => {
    if (window.confirm('¿Eliminar venta? (Visualmente)')) {
       setVentas(ventas.filter(v => v.idVenta !== idVenta));
       if (ventasVisibles.length === 1 && paginaActual > 1) {
           setPaginaActual(paginaActual - 1);
       }
    }
  };
  
  const limpiarFormulario = () => {
    setItemsVenta([]);
    setFormData({
      idCliente: '',
      Fecha_Venta: getFechaDeHoy(),
      tipoVenta: 'Contado',
      montoPagadoInicial: 0,
      idMetodoPago: ''
    });
    setItemActual('');
    setCantidadActual(1);
    setPrecioActual(0);
    setEditingVenta(null);
  };

  const handleEditarVenta = (venta) => {
    setEditingVenta(venta);
    setFormData({
        idCliente: String(venta.idCliente),
        Fecha_Venta: venta.Fecha_Venta,
        tipoVenta: venta.tipoVenta,
        montoPagadoInicial: venta.montoPagadoInicial,
        idMetodoPago: String(venta.idMetodoPago)
    });
    
    const detalles = allDetalles.filter(d => String(d.idVenta) === String(venta.idVenta));
    const itemsMapeados = detalles.map(d => {
        const prod = productos.find(p => String(p.idProduc) === String(d.idProduc));
        return { ...d, nomProduc: prod ? prod.nomProduc : (d.nomProduc || 'Item') };
    });
    
    setItemsVenta(itemsMapeados);
    setIsFormModalOpen(true);
  };

  const handleProductoSelect = (idProduc) => {
    const producto = productos.find(p => String(p.idProduc) === idProduc);
    if (producto) {
      setItemActual(producto);
      setPrecioActual(producto.precioProduc); 
    }
  };

  const handleAddItem = () => {
    if (!itemActual || cantidadActual <= 0) {
      alert("Datos inválidos.");
      return;
    }
    
    const subtotal = Number(cantidadActual) * Number(precioActual);
    const nuevoItem = {
        idProduc: itemActual.idProduc,
        nomProduc: itemActual.nomProduc,
        CantidadProduc: Number(cantidadActual),
        precioProduc: Number(precioActual),
        Subtotal: subtotal
    };
    
    setItemsVenta([...itemsVenta, nuevoItem]);
    setItemActual(''); setCantidadActual(1); setPrecioActual(0);
  };
  
  const handleRemoveItem = (idProduc) => {
    setItemsVenta(itemsVenta.filter(i => String(i.idProduc) !== String(idProduc)));
  };

  const calcularTotal = () => {
    return itemsVenta.reduce((total, item) => total + item.Subtotal, 0);
  };
  
  useEffect(() => {
    if (formData.tipoVenta === 'Contado') {
      setFormData(prev => ({ ...prev, montoPagadoInicial: calcularTotal() }));
    }
  }, [itemsVenta, formData.tipoVenta]);

  const handleSubmitVenta = (e) => {
    e.preventDefault();
    if (!formData.idCliente || itemsVenta.length === 0) return;

    const totalVenta = calcularTotal();
    const clienteObj = clientes.find(c => String(c.idCliente) === formData.idCliente);
    const metodoObj = metodosPago.find(m => String(m.idMetodoPago) === formData.idMetodoPago);

    const nuevaVenta = {
      idVenta: editingVenta ? editingVenta.idVenta : `VENTA-${Date.now()}`,
      idCliente: Number(formData.idCliente),
      Fecha_Venta: formData.Fecha_Venta,
      Total: totalVenta,
      tipoVenta: formData.tipoVenta,
      montoPagadoInicial: Number(formData.montoPagadoInicial),
      estadoPago: (formData.tipoVenta === 'Contado' || Number(formData.montoPagadoInicial) >= totalVenta) ? 'Pagado' : 'Pendiente',
      idMetodoPago: Number(formData.idMetodoPago),
      nombreCliente: clienteObj ? clienteObj.nomCliente : '...',
      nombreMetodo: metodoObj ? metodoObj.nomMetodoPago : '...'
    };

    if (editingVenta) {
      setVentas(ventas.map(v => v.idVenta === editingVenta.idVenta ? nuevaVenta : v));
      const otrosDetalles = allDetalles.filter(d => String(d.idVenta) !== String(editingVenta.idVenta));
      const nuevosDetalles = itemsVenta.map(item => ({ ...item, idVenta: editingVenta.idVenta }));
      setAllDetalles([...otrosDetalles, ...nuevosDetalles]);
    } else {
      setVentas([nuevaVenta, ...ventas]); 
      const nuevosDetalles = itemsVenta.map(item => ({ ...item, idVenta: nuevaVenta.idVenta }));
      setAllDetalles([...allDetalles, ...nuevosDetalles]);
    }
    
    setIsFormModalOpen(false);
    limpiarFormulario();
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pagado': return 'bg-green-600';
      case 'Pendiente': return 'bg-yellow-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">    
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-blue-900 text-4xl mb-2">Ventas</h1>
          <p className="text-gray-600">
            Mostrando {ventasVisibles.length} de {ventas.length} registros (Página {paginaActual} de {totalPaginas})
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              const hoja = XLSX.utils.json_to_sheet(ventas);
              const libro = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(libro, hoja, "Ventas");
              XLSX.writeFile(libro, "ventas_reporte.xlsx");
            }}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Excel
          </Button>
          
          <Dialog open={isFormModalOpen} onOpenChange={(open) => { if(!open) limpiarFormulario(); setIsFormModalOpen(open); }}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { limpiarFormulario(); setIsFormModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Nueva Venta
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-blue-900">{editingVenta ? 'Editar Venta' : 'Registrar Nueva Venta'}</DialogTitle>
                    <DialogDescription>Completa los datos para registrar la transacción.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitVenta} className="space-y-4"> 
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Cliente</Label>
                            <Select value={String(formData.idCliente)} onValueChange={(v) => setFormData({...formData, idCliente: v})}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                            <SelectContent>
                                {clientes.map(c => (<SelectItem key={c.idCliente} value={String(c.idCliente)}>{c.nomCliente}</SelectItem>))}
                            </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Fecha</Label>
                            <Input type="date" value={formData.Fecha_Venta} onChange={e => setFormData({...formData, Fecha_Venta: e.target.value})} />
                        </div>
                        <div>
                            <Label>Tipo</Label>
                            <Select value={formData.tipoVenta} onValueChange={(v) => setFormData({...formData, tipoVenta: v})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Contado">Contado</SelectItem>
                                <SelectItem value="Crédito">Crédito</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-2 border p-4 rounded-lg">
                        <div className="col-span-6">
                            <Label>Producto</Label>
                            <Select onValueChange={handleProductoSelect}>
                            <SelectTrigger><SelectValue placeholder="Buscar..." /></SelectTrigger>
                            <SelectContent>
                                {productos.map(p => (<SelectItem key={p.idProduc} value={String(p.idProduc)} disabled={p.Stock <= 0}>{p.nomProduc}</SelectItem>))}
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2"><Label>Precio</Label><Input type="number" step="0.01" value={precioActual} onChange={e => setPrecioActual(e.target.value)} /></div>
                        <div className="col-span-2"><Label>Cant.</Label><Input type="number" value={cantidadActual} onChange={e => setCantidadActual(e.target.value)} /></div>
                        <div className="col-span-2 flex items-end"><Button type="button" onClick={handleAddItem} className="w-full">Añadir</Button></div>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 p-2 rounded">
                        {itemsVenta.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 border-b bg-white">
                            <span>{item.nomProduc} (x{item.CantidadProduc})</span>
                            <div className="flex items-center gap-4">
                                <span>S/ {Number(item.Subtotal).toFixed(2)}</span>
                                <Button variant="ghost" size="sm" type="button" onClick={() => handleRemoveItem(item.idProduc)}><XCircle className="h-4 w-4 text-red-600" /></Button>
                            </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                        <div>
                            <Label>Método Pago</Label>
                            <Select value={String(formData.idMetodoPago)} onValueChange={(v) => setFormData({...formData, idMetodoPago: v})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>{metodosPago.map(m => (<SelectItem key={m.idMetodoPago} value={String(m.idMetodoPago)}>{m.nomMetodoPago}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div><Label>Monto Pagado</Label><Input type="number" value={formData.montoPagadoInicial} onChange={e => setFormData({...formData, montoPagadoInicial: e.target.value})} disabled={formData.tipoVenta === 'Contado'}/></div>
                        <div className="flex items-end justify-end"><h3 className="text-2xl font-bold text-blue-900">Total: S/ {calcularTotal().toFixed(2)}</h3></div>
                    </div>

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700"><ShoppingCart className="h-4 w-4 mr-2" />{editingVenta ? 'Actualizar' : 'Guardar'}</Button>
                </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Venta</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Pagado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Método</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          {/* LISTA PAGINADA */}
          <TableBody>
            {ventasVisibles.map((venta) => (
              <TableRow key={venta.idVenta}>
                <TableCell>{venta.idVenta}</TableCell>
                <TableCell>{venta.Fecha_Venta}</TableCell>
                <TableCell className="text-blue-900 font-medium">{venta.nombreCliente}</TableCell>
                <TableCell>S/ {Number(venta.Total).toFixed(2)}</TableCell>
                <TableCell>{venta.tipoVenta}</TableCell>
                <TableCell>S/ {Number(venta.montoPagadoInicial).toFixed(2)}</TableCell>
                <TableCell><Badge className={getEstadoColor(venta.estadoPago)}>{venta.estadoPago}</Badge></TableCell>
                <TableCell>{venta.nombreMetodo}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleVerDetalle(venta)}><Eye className="h-4 w-4 text-blue-600" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditarVenta(venta)}><Pencil className="h-4 w-4 text-blue-600" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteVenta(venta.idVenta)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {ventasVisibles.length === 0 && (
                <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">No se encontraron ventas</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- CONTROLES DE PAGINACIÓN --- */}
      {ventas.length > 0 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 border-t rounded-lg shadow">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indicePrimerItem + 1}</span> a <span className="font-medium">{Math.min(indiceUltimoItem, ventas.length)}</span> de <span className="font-medium">{ventas.length}</span> resultados
                </span>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1} className="flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" /> Anterior
                </Button>
                <span className="text-sm font-medium px-2">Pág {paginaActual} / {totalPaginas}</span>
                <Button variant="outline" size="sm" onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} className="flex items-center gap-1">
                    Siguiente <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
          </div>
      )}

      {/* MODAL DETALLE */}
      <Dialog open={isDetalleModalOpen} onOpenChange={(open) => {if(!open) setVentaActual(null); setIsDetalleModalOpen(open);}}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Detalle #{ventaActual?.idVenta}</DialogTitle>
            <DialogDescription>Resumen de productos y totales de la venta.</DialogDescription>
          </DialogHeader>

            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                   <div><p className="text-sm text-gray-500">Cliente</p><p className="font-bold">{ventaActual?.nombreCliente}</p></div>
                   <div><p className="text-sm text-gray-500">Total</p><p className="font-bold text-lg text-blue-800">S/ {Number(ventaActual?.Total).toFixed(2)}</p></div>
               </div>
               <Table>
                   <TableHeader><TableRow><TableHead>Prod</TableHead><TableHead>Cant</TableHead><TableHead>Subtotal</TableHead></TableRow></TableHeader>
                   <TableBody>
                       {detalleVenta.map((d, i) => (
                           <TableRow key={i}>
                               <TableCell>{d.nomProduc}</TableCell>
                               <TableCell>{d.CantidadProduc}</TableCell>
                               <TableCell>S/ {Number(d.Subtotal).toFixed(2)}</TableCell>
                           </TableRow>
                       ))}
                   </TableBody>
               </Table>
               
               {ventaActual && detalleVenta.length > 0 && (
                   <div className="mt-4">
                        <PDFDownloadLink document={<GuiaVentaPDF venta={ventaActual} detalle={detalleVenta} />} fileName={`Boleta-${ventaActual.idVenta}.pdf`}>
                            {({ loading }) => (
                                <Button disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
                                    <FileText className="h-4 w-4 mr-2" />
                                    {loading ? 'Generando...' : 'Descargar Boleta PDF'}
                                </Button>
                            )}
                        </PDFDownloadLink>
                   </div>
               )}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}