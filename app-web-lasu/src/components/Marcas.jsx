import { useState, useEffect } from 'react';
import Papa from 'papaparse'; // <--- Usamos PapaParse en lugar de Axios
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export function Marcas() {
  // 1. El estado empieza vacío
  const [marcas, setMarcas] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [editingMarca, setEditingMarca] = useState(null);
  const [formData, setFormData] = useState({ nomMarca: '' });

  // --- HELPER PARA LEER CSV ---
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

  // --- (R)EAD: Cargar desde CSV ---
  const cargarMarcas = async () => {
    try {
      const data = await fetchCsvData('/data/marca.csv');
      // Aseguramos que el ID sea string para consistencia
      const marcasProcesadas = data.map(m => ({
          ...m,
          idMarca: String(m.idMarca)
      }));
      setMarcas(marcasProcesadas);
    } catch (error) {
      console.error('Error al cargar las marcas:', error);
    }
  };

  // Carga las marcas la primera vez
  useEffect(() => {
    cargarMarcas();
  }, []);

  // --- (C)REATE y (U)PDATE (Simulado) ---
  const handleSubmit = (e) => {
    e.preventDefault();
    const { nomMarca } = formData;

    const idParaGuardar = editingMarca 
      ? editingMarca.idMarca 
      : `MAR-${Date.now()}`; // ID temporal simulado

    const nuevaMarca = {
        idMarca: idParaGuardar,
        nomMarca: nomMarca
    };

    if (editingMarca) {
        // UPDATE
        setMarcas(marcas.map(m => m.idMarca === editingMarca.idMarca ? nuevaMarca : m));
    } else {
        // CREATE
        setMarcas([...marcas, nuevaMarca]);
    }
      
    setIsOpen(false);
    setFormData({ nomMarca: '' });
    setEditingMarca(null);
    alert("Marca guardada (Simulación en memoria)");
  };

  const handleEdit = (marca) => {
    setEditingMarca(marca);
    setFormData({ nomMarca: marca.nomMarca });
    setIsOpen(true);
  };

  // --- (D)ELETE (Simulado) ---
  const handleDelete = (idMarca) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta marca? (Solo visualmente)')) {
       setMarcas(marcas.filter(m => m.idMarca !== idMarca));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-blue-900 text-4xl mb-2">Marcas</h1>
          <p className="text-gray-600">Gestión de marcas (CSV Local)</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { if(!open) { setEditingMarca(null); setFormData({nomMarca:''}); } setIsOpen(open); }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
              setEditingMarca(null);
              setFormData({ nomMarca: '' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Marca
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-blue-900">
                {editingMarca ? 'Editar Marca' : 'Nueva Marca'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nomMarca">Nombre de Marca</Label>
                <Input
                  id="nomMarca"
                  value={formData.nomMarca}
                  onChange={(e) => setFormData({ ...formData, nomMarca: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {editingMarca ? 'Actualizar' : 'Crear'}
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
            {marcas.map((marca) => (
              <TableRow key={marca.idMarca}>
                <TableCell>{marca.idMarca}</TableCell>
                <TableCell className="text-blue-900 font-medium">{marca.nomMarca}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(marca)}>
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(marca.idMarca)}>
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