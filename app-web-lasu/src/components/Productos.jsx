import { useState, useEffect } from 'react';
import Papa from 'papaparse'; // <--- Usamos PapaParse
import { Plus, Pencil, Trash2, FileDown } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import * as XLSX from 'xlsx';

export function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]); // Se llenará leyendo el CSV de productos

  const [isOpen, setIsOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  
  // Formulario adaptado a tus columnas
  const [formData, setFormData] = useState({ 
    nomProduc: '', 
    categoria: '', 
    precioProduc: 0,
    Stock: 0
  });

  // --- LEER CSV ---
  const fetchCsvData = (path) => {
    return new Promise((resolve) => {
        Papa.parse(path, {
            download: true,
            header: true,
            dynamicTyping: true, // Convierte números automáticamente
            skipEmptyLines: true,
            complete: (result) => resolve(result.data),
            error: (err) => {
                console.error("Error leyendo CSV:", err);
                resolve([]);
            }
        });
    });
  };

  // --- (R)EAD: Cargar Datos ---
  const cargarDatos = async () => {
    try {
      const dataProductos = await fetchCsvData('/data/producto.csv');
      
      // 1. Guardamos los productos
      // Nos aseguramos que el ID sea texto para evitar problemas
      const productosProcesados = dataProductos.map(p => ({
          ...p,
          idProduc: String(p.idProduc)
      }));
      
      // Ordenar por ID numérico inverso si es posible
      productosProcesados.sort((a, b) => Number(b.idProduc) - Number(a.idProduc));
      setProductos(productosProcesados);

      // 2. Extraer Categorías Únicas del propio CSV
      // Esto crea la lista del Dropdown automáticamente basada en lo que hay en el archivo
      const categoriasUnicas = [...new Set(productosProcesados.map(p => p.categoria))].filter(Boolean);
      setCategorias(categoriasUnicas.sort());

    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- (C)REATE y (U)PDATE ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const idParaGuardar = editingProducto 
      ? editingProducto.idProduc 
      : String(productos.length + 1001); // ID Simulado

    const datosProducto = {
      idProduc: idParaGuardar,
      nomProduc: formData.nomProduc,
      categoria: formData.categoria,
      precioProduc: Number(formData.precioProduc),
      Stock: Number(formData.Stock)
    };

    if (editingProducto) {
      // UPDATE
      setProductos(productos.map(p => p.idProduc === editingProducto.idProduc ? datosProducto : p));
    } else {
      // CREATE
      setProductos([datosProducto, ...productos]);
      
      // Si la categoría es nueva, la agregamos a la lista de opciones
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

  // --- (D)ELETE ---
  const handleDelete = (idProduc) => {
    if (window.confirm('¿Eliminar producto? (Solo visualmente)')) {
       setProductos(productos.filter(p => p.idProduc !== idProduc));
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
                
                {/* SELECTOR DE CATEGORÍA (Generado dinámicamente del CSV) */}
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
                    
                    {/* INPUT DE STOCK */}
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
            {productos.map((producto) => (
              <TableRow key={producto.idProduc}>
                <TableCell>{producto.idProduc}</TableCell>
                <TableCell className="text-blue-900">{producto.nomProduc}</TableCell>
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
    </div>
  );
}