import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Plus, Pencil, Trash2, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import * as XLSX from 'xlsx';

export function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  // --- PAGINACIÓN ---
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(20);

  const [isOpen, setIsOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  
  const [formData, setFormData] = useState({ 
    nomProduc: '', 
    categoria: '', 
    precioProduc: 0,
    Stock: 0
  });

  // --- HELPER CSV (CORREGIDO PARA GITHUB PAGES) ---
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

  const cargarDatos = async () => {
    try {
      const dataProductos = await fetchCsvData('data/producto.csv');
      
      const productosProcesados = dataProductos.map(p => ({
          ...p,
          idProduc: String(p.idProduc)
      }));
      
      productosProcesados.sort((a, b) => Number(b.idProduc) - Number(a.idProduc));
      setProductos(productosProcesados);

      // Extraer categorías únicas
      const categoriasUnicas = [...new Set(productosProcesados.map(p => p.categoria))].filter(Boolean);
      setCategorias(categoriasUnicas.sort());

    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- LÓGICA PAGINACIÓN ---
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const productosVisibles = productos.slice(indicePrimerItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(productos.length / itemsPorPagina);
  const cambiarPagina = (n) => setPaginaActual(n);

  // --- CRUD ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const idParaGuardar = editingProducto 
      ? editingProducto.idProduc 
      : String(productos.length + 1001);

    const datosProducto = {
      idProduc: idParaGuardar,
      nomProduc: formData.nomProduc,
      categoria: formData.categoria,
      precioProduc: Number(formData.precioProduc),
      Stock: Number(formData.Stock)
    };

    if (editingProducto) {
      setProductos(productos.map(p => p.idProduc === editingProducto.idProduc ? datosProducto : p));
    } else {
      setProductos([datosProducto, ...productos]);
      if (!categorias.includes(formData.categoria)) {
          setCategorias([...categorias, formData.categoria].sort());
      }
    }
      
    setIsOpen(false);
    limpiarFormulario();
  };

  const handleEdit = (producto) => {
    setEditingProducto(producto);
    setFormData({ 
      nomProduc: producto.nomProduc,
      categoria: producto.categoria,
      precioProduc: producto.precioProduc,
      Stock: producto.Stock
    });
    setIsOpen(true);
  };

  const limpiarFormulario = () => {
      setEditingProducto(null);
      setFormData({ nomProduc: '', categoria: '', precioProduc: 0, Stock: 0 });
  }

  const handleDelete = (idProduc) => {
    if (window.confirm('¿Eliminar producto? (Solo visualmente)')) {
       const nuevosProds = productos.filter(p => p.idProduc !== idProduc);
       setProductos(nuevosProds);
       // Ajustar página si se vacía
       if (nuevosProds.slice(indicePrimerItem, indiceUltimoItem).length === 0 && paginaActual > 1) {
           setPaginaActual(paginaActual - 1);
       }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-blue-900 text-4xl mb-2">Productos</h1>
          <p className="text-gray-600">Inventario cargado desde CSV</p>
        </div>
        <div className="flex gap-2">
            <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                const hoja = XLSX.utils.json_to_sheet(productos);
                const libro = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(libro, hoja, "Inventario");
                XLSX.writeFile(libro, "productos.xlsx");
                }}
            >
                <FileDown className="h-4 w-4 mr-2" />
                Exportar
            </Button>

            <Dialog open={isOpen} onOpenChange={(open) => { if(!open) limpiarFormulario(); setIsOpen(open); }}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                <DialogTitle className="text-blue-900">
                    {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
                </DialogTitle>
                <DialogDescription>Información del producto.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="nomProduc">Nombre del Producto</Label>
                    <Input
                    id="nomProduc"
                    value={formData.nomProduc}
                    onChange={(e) => setFormData({ ...formData, nomProduc: e.target.value })}
                    required
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="categoria">Categoría</Label>
                        <Select 
                            value={formData.categoria} 
                            onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                        >
                            <SelectTrigger>
                            <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                            {categorias.map((cat, index) => (
                                <SelectItem key={index} value={cat}>{cat}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <Label htmlFor="Stock">Stock</Label>
                        <Input
                            id="Stock"
                            type="number"
                            value={formData.Stock}
                            onChange={(e) => setFormData({ ...formData, Stock: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="precioProduc">Precio (S/)</Label>
                    <Input
                        id="precioProduc"
                        type="number"
                        step="0.01"
                        value={formData.precioProduc}
                        onChange={(e) => setFormData({ ...formData, precioProduc: e.target.value })}
                        required
                    />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    {editingProducto ? 'Actualizar' : 'Crear'}
                </Button>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productosVisibles.map((producto) => (
              <TableRow key={producto.idProduc}>
                <TableCell>{producto.idProduc}</TableCell>
                <TableCell className="text-blue-900 font-medium">{producto.nomProduc}</TableCell>
                <TableCell><Badge variant="outline">{producto.categoria}</Badge></TableCell>
                <TableCell>S/ {Number(producto.precioProduc).toFixed(2)}</TableCell>
                <TableCell>{producto.Stock}</TableCell>
                <TableCell>
                  {producto.Stock <= 10 ? (
                    <Badge variant="destructive">Bajo</Badge>
                  ) : producto.Stock <= 30 ? (
                    <Badge className="bg-yellow-600">Medio</Badge>
                  ) : (
                    <Badge className="bg-green-600">OK</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(producto)}>
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(producto.idProduc)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {productos.length > 0 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 border-t rounded-lg shadow">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Mostrando {indicePrimerItem + 1} - {Math.min(indiceUltimoItem, productos.length)} de {productos.length}</span>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}><ChevronLeft className="h-4 w-4" /> Ant.</Button>
                <span className="text-sm font-medium px-2 flex items-center">Pág {paginaActual}/{totalPaginas}</span>
                <Button variant="outline" size="sm" onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>Sig. <ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
      )}
    </div>
  );
}