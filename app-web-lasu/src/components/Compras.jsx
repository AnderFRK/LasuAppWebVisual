import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Plus, Eye, Trash2, XCircle, ShoppingCart, Pencil, ChevronLeft, ChevronRight } from 'lucide-react'; // <-- Agregados Chevrons
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const getFechaDeHoy = () => new Date().toISOString().split('T')[0];

export function Compras() {
  const [compras, setCompras] = useState([]);
  const [allDetalles, setAllDetalles] = useState([]);
  const [detalleCompra, setDetalleCompra] = useState([]);
  const [compraActual, setCompraActual] = useState(null);
  
  // --- ESTADOS DE PAGINACIÓN ---
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(20); 

  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCompra, setEditingCompra] = useState(null); 

  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  
  const [itemsCompra, setItemsCompra] = useState([]); 
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [fechaCompra, setFechaCompra] = useState(getFechaDeHoy()); 
  
  const [itemActual, setItemActual] = useState('');
  const [cantidadActual, setCantidadActual] = useState(1);
  const [precioActual, setPrecioActual] = useState(0);

  const fetchCsvData = (path) => {
    return new Promise((resolve) => {
        Papa.parse(path, {
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

  const cargarDatos = async () => {
    try {
      const [dataCompras, dataDetalles, dataVendedores, dataProductos] = await Promise.all([
        fetchCsvData('/data/compras.csv'),
        fetchCsvData('/data/detalle_compra.csv'),
        fetchCsvData('/data/vendedor.csv'),
        fetchCsvData('/data/producto.csv')
      ]);

      setAllDetalles(dataDetalles);
      setProveedores(dataVendedores);
      setProductos(dataProductos);

      const comprasEnriquecidas = dataCompras.map(c => {
          const vendedor = dataVendedores.find(v => String(v.idVende) === String(c.idVende));
          return {
              ...c,
              idCompra: String(c.idCompra),
              nombreProveedor: vendedor ? vendedor.nomVende : 'Proveedor Eliminado'
          };
      });

      comprasEnriquecidas.sort((a, b) => {
         const numA = parseInt(a.idCompra.replace(/\D/g, '')) || 0;
         const numB = parseInt(b.idCompra.replace(/\D/g, '')) || 0;
         return numB - numA; 
      });

      // YA NO cortamos aquí con .slice(0, 20) porque la paginación se encargará de eso
      setCompras(comprasEnriquecidas);

    } catch (error) {
      console.error('Error al cargar datos CSV:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- LÓGICA DE PAGINACIÓN ---
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  // Esto corta el array GRANDE para mostrar solo el trozo actual
  const comprasVisibles = compras.slice(indicePrimerItem, indiceUltimoItem); 
  const totalPaginas = Math.ceil(compras.length / itemsPorPagina);

  const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  const handleVerDetalle = (compra) => {
    setCompraActual(compra);
    const detallesFiltrados = allDetalles.filter(d => String(d.idCompra) === String(compra.idCompra));
    const detallesConNombre = detallesFiltrados.map(d => {
        const prod = productos.find(p => String(p.idProduc) === String(d.idProduc));
        return {
            ...d,
            nomProduc: prod ? prod.nomProduc : 'Producto'
        };
    });
    setDetalleCompra(detallesConNombre);
    setIsDetalleModalOpen(true);
  };

  const handleDeleteCompra = (idCompra) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta compra? (Visualmente)')) {
       setCompras(compras.filter(c => c.idCompra !== idCompra));
       // Si borramos el último de la página, retrocedemos
       if (comprasVisibles.length === 1 && paginaActual > 1) {
           setPaginaActual(paginaActual - 1);
       }
    }
  };
  
  const limpiarFormulario = () => {
    setItemsCompra([]);
    setProveedorSeleccionado('');
    setFechaCompra(getFechaDeHoy());
    setItemActual('');
    setCantidadActual(1);
    setPrecioActual(0);
    setEditingCompra(null);
  };

  const handleEditarCompra = (compra) => {
    setEditingCompra(compra);
    setProveedorSeleccionado(String(compra.idVende));
    setFechaCompra(compra.Fecha_Compra);
    
    const detalles = allDetalles.filter(d => String(d.idCompra) === String(compra.idCompra));
    const itemsMapeados = detalles.map(item => {
        const prod = productos.find(p => String(p.idProduc) === String(item.idProduc));
        return {
            ...item,
            nomProduc: prod ? prod.nomProduc : 'Producto',
            CantidadProduc: Number(item.CantidadProduc),
            precioProduc: Number(item.precioProduc)
        };
    });
    setItemsCompra(itemsMapeados);
    setIsFormModalOpen(true);
  };

  const handleProductoSelect = (idProduc) => {
    const producto = productos.find(p => String(p.idProduc) === idProduc);
    if (producto) {
      setItemActual(producto);
      const costoEstimado = producto.precioProduc ? (producto.precioProduc * 0.6) : 0;
      setPrecioActual(Number(costoEstimado).toFixed(2)); 
    }
  };

  const handleAddItem = () => {
    if (!itemActual || cantidadActual <= 0 || precioActual <= 0) {
      alert("Selecciona producto, cantidad y costo válidos.");
      return;
    }
    
    const itemExistente = itemsCompra.find(i => String(i.idProduc) === String(itemActual.idProduc));
    
    if (itemExistente) {
      setItemsCompra(itemsCompra.map(i => 
        String(i.idProduc) === String(itemActual.idProduc)
        ? { ...i, CantidadProduc: i.CantidadProduc + Number(cantidadActual), precioProduc: Number(precioActual) }
        : i
      ));
    } else {
      setItemsCompra([
        ...itemsCompra,
        {
          idProduc: itemActual.idProduc,
          nomProduc: itemActual.nomProduc,
          CantidadProduc: Number(cantidadActual),
          precioProduc: Number(precioActual),
        }
      ]);
    }
    setItemActual(''); setCantidadActual(1); setPrecioActual(0);
  };
  
  const handleRemoveItem = (idProduc) => {
    setItemsCompra(itemsCompra.filter(i => String(i.idProduc) !== String(idProduc)));
  };

  const calcularTotal = () => {
    return itemsCompra.reduce((total, item) => total + (item.precioProduc * item.CantidadProduc), 0);
  };

  const handleSubmitCompra = (e) => {
    e.preventDefault();
    if (!proveedorSeleccionado || itemsCompra.length === 0) {
      alert("Faltan datos.");
      return;
    }

    const totalCalculado = calcularTotal();
    const vendedorObj = proveedores.find(v => String(v.idVende) === proveedorSeleccionado);

    const nuevaCompra = {
      idCompra: editingCompra ? editingCompra.idCompra : `COMPRA-NUEVA-${Date.now()}`,
      idVende: proveedorSeleccionado,
      Fecha_Compra: fechaCompra,
      Total: totalCalculado,
      nombreProveedor: vendedorObj ? vendedorObj.nomVende : '...'
    };

    if (editingCompra) {
        setCompras(compras.map(c => c.idCompra === editingCompra.idCompra ? nuevaCompra : c));
        const otrosDetalles = allDetalles.filter(d => String(d.idCompra) !== String(editingCompra.idCompra));
        const nuevosDetalles = itemsCompra.map(item => ({
            ...item,
            idCompra: editingCompra.idCompra,
            Subtotal: item.CantidadProduc * item.precioProduc
        }));
        setAllDetalles([...otrosDetalles, ...nuevosDetalles]);
    } else {
        setCompras([nuevaCompra, ...compras]); // Añadimos al principio del array global
        const nuevosDetalles = itemsCompra.map(item => ({
            ...item,
            idCompra: nuevaCompra.idCompra,
            Subtotal: item.CantidadProduc * item.precioProduc
        }));
        setAllDetalles([...allDetalles, ...nuevosDetalles]);
    }
      
    setIsFormModalOpen(false);
    limpiarFormulario();
    alert("Compra guardada (Simulación en memoria)");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-blue-900 text-4xl mb-2">Compras</h1>
          <p className="text-gray-600">
            Mostrando {comprasVisibles.length} de {compras.length} registros (Página {paginaActual} de {totalPaginas})
          </p>
        </div>
        
        <Dialog open={isFormModalOpen} onOpenChange={(open) => {
          if(!open) limpiarFormulario();
          setIsFormModalOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
              limpiarFormulario(); 
              setIsFormModalOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Compra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-blue-900">
                {editingCompra ? 'Editar Compra' : 'Registrar Nueva Compra'}
              </DialogTitle>
              <DialogDescription>Ingresa los datos del proveedor y la mercadería recibida.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitCompra} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="proveedor">Proveedor (Vendedor)</Label>
                  <Select value={proveedorSeleccionado} onValueChange={setProveedorSeleccionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar un proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {proveedores.map(v => (
                        <SelectItem key={v.idVende} value={String(v.idVende)}>{v.nomVende}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fecha">Fecha de Compra</Label>
                  <Input type="date" value={fechaCompra} onChange={e => setFechaCompra(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 border p-4 rounded-lg">
                <div className="col-span-6">
                  <Label>Producto</Label>
                  <Select onValueChange={handleProductoSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Buscar producto..." />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map(p => (
                        <SelectItem key={p.idProduc} value={String(p.idProduc)}>{p.nomProduc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Costo Unit.</Label>
                  <Input type="number" step="0.01" value={precioActual} onChange={e => setPrecioActual(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Label>Cantidad</Label>
                  <Input type="number" value={cantidadActual} onChange={e => setCantidadActual(e.target.value)} />
                </div>
                <div className="col-span-2 flex items-end">
                  <Button type="button" onClick={handleAddItem} className="w-full">Añadir</Button>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 p-2 rounded">
                <h4 className="font-medium text-sm text-gray-500 mb-2">Items en la Compra</h4>
                {itemsCompra.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 border-b bg-white">
                    <span>{item.nomProduc} (x{item.CantidadProduc})</span>
                    <div className="flex items-center gap-4">
                        <span>S/ {(item.precioProduc * item.CantidadProduc).toFixed(2)}</span>
                        <Button variant="ghost" size="sm" type="button" onClick={() => handleRemoveItem(item.idProduc)}>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <h3 className="text-2xl font-bold text-blue-900">
                  Total: S/ {calcularTotal().toFixed(2)}
                </h3>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {editingCompra ? 'Actualizar Compra' : 'Guardar Compra'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Compra</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          {/* AQUÍ SE MAPEA LA LISTA PAGINADA (comprasVisibles) */}
          <TableBody>
            {comprasVisibles.map((compra) => (
              <TableRow key={compra.idCompra}>
                <TableCell>{compra.idCompra}</TableCell>
                <TableCell>{new Date(compra.Fecha_Compra).toLocaleDateString()}</TableCell>
                <TableCell className="text-blue-900 font-medium">{compra.nombreProveedor}</TableCell>
                <TableCell>S/ {Number(compra.Total).toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleVerDetalle(compra)}>
                        <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditarCompra(compra)}>
                        <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCompra(compra.idCompra)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {comprasVisibles.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">No hay compras registradas</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- CONTROLES DE PAGINACIÓN --- */}
      {compras.length > 0 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 border-t rounded-lg shadow">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indicePrimerItem + 1}</span> a <span className="font-medium">{Math.min(indiceUltimoItem, compras.length)}</span> de <span className="font-medium">{compras.length}</span> resultados
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

      {/* --- MODAL DETALLE --- */}
      <Dialog open={isDetalleModalOpen} onOpenChange={(open) => {if(!open) setCompraActual(null); setIsDetalleModalOpen(open);}}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle className="text-blue-900">Detalle de Compra #{compraActual?.idCompra}</DialogTitle>
                <DialogDescription>Proveedor: {compraActual?.nombreProveedor}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Costo Unit.</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Subtotal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {detalleCompra.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.nomProduc}</TableCell>
                                <TableCell>S/ {Number(item.precioProduc).toFixed(2)}</TableCell>
                                <TableCell>{item.CantidadProduc}</TableCell>
                                <TableCell>S/ {(item.precioProduc * item.CantidadProduc).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="text-right">
                    <p className="text-lg font-bold text-blue-900">Total Compra: S/ {Number(compraActual?.Total).toFixed(2)}</p>
                </div>
            </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}