import { useState, useEffect } from 'react';
import Papa from 'papaparse'; // <--- Usamos PapaParse en lugar de Axios
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export function Categorias() {
  // 1. El estado empieza vacío
  const [categorias, setCategorias] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [formData, setFormData] = useState({ nomCateg: '' });

  // --- HELPER PARA LEER CSV ---
  const fetchCsvData = (path) => {
    return new Promise((resolve) => {
        Papa.parse(path, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (result) => resolve(result.data),
            error: (err) => {
                console.error("Error leyendo CSV:", err);
                resolve([]);
            }
        });
    });
  };

  // --- (R)EAD: Cargar desde CSV ---
  const cargarCategorias = async () => {
    try {
      const data = await fetchCsvData('/data/categoria.csv');
      
      // Aseguramos que el ID sea string para evitar problemas de tipos y ordenamos
      const categoriasProcesadas = data.map(c => ({
          ...c,
          idCateg: String(c.idCateg)
      }));
      
      setCategorias(categoriasProcesadas);
    } catch (error) {
      console.error('Error al cargar las categorías:', error);
    }
  };

  // Carga las categorías la primera vez
  useEffect(() => {
    cargarCategorias();
  }, []);

  // --- (C)REATE y (U)PDATE (Simulado) ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { nomCateg } = formData;

    const idParaGuardar = editingCategoria 
      ? editingCategoria.idCateg 
      : `CAT-${Date.now()}`; // ID temporal simulado para nuevos registros

    const nuevaCategoria = {
        idCateg: idParaGuardar,
        nomCateg: nomCateg
    };

    if (editingCategoria) {
        // UPDATE: Actualizamos el array en memoria
        setCategorias(categorias.map(c => c.idCateg === editingCategoria.idCateg ? nuevaCategoria : c));
    } else {
        // CREATE: Agregamos al array en memoria
        setCategorias([...categorias, nuevaCategoria]);
    }
      
    setIsOpen(false);
    setFormData({ nomCateg: '' });
    setEditingCategoria(null);
    alert("Categoría guardada (Simulación en memoria)");
  };

  const handleEdit = (categoria) => {
    setEditingCategoria(categoria);
    setFormData({ nomCateg: categoria.nomCateg });
    setIsOpen(true);
  };

  // --- (D)ELETE (Simulado) ---
  const handleDelete = (idCateg) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría? (Solo visualmente)')) {
       setCategorias(categorias.filter(c => c.idCateg !== idCateg));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-blue-900 text-4xl mb-2">Categorías</h1>
          <p className="text-gray-600">Gestión de categorías (CSV Local)</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { 
            if(!open) { 
                setEditingCategoria(null); 
                setFormData({nomCateg:''}); 
            } 
            setIsOpen(open); 
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
              setEditingCategoria(null);
              setFormData({ nomCateg: '' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-blue-900">
                {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nomCateg">Nombre de Categoría</Label>
                <Input
                  id="nomCateg"
                  value={formData.nomCateg}
                  onChange={(e) => setFormData({ ...formData, nomCateg: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {editingCategoria ? 'Actualizar' : 'Crear'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categorias.map((categoria) => (
              <TableRow key={categoria.idCateg}>
                <TableCell>{categoria.idCateg}</TableCell>
                <TableCell className="text-blue-900 font-medium">{categoria.nomCateg}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(categoria)}>
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(categoria.idCateg)}>
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