import { useState, useEffect } from 'react';
import Papa from 'papaparse'; // <--- Usamos PapaParse
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export function Distritos() {
  // 1. El estado empieza vacío
  const [distritos, setDistritos] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [editingDistrito, setEditingDistrito] = useState(null);
  const [formData, setFormData] = useState({ nomDistr: '' });

  // --- HELPER PARA LEER CSV (Corregido para GitHub Pages) ---
  const fetchCsvData = (path) => {
    // Quitamos la barra inicial si la tiene y agregamos la base del repo
    const relativePath = path.startsWith('/') ? path.slice(1) : path;
    const url = `${import.meta.env.BASE_URL}${relativePath}`;

    return new Promise((resolve) => {
        Papa.parse(url, {
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
  const cargarDistritos = async () => {
    try {
      const data = await fetchCsvData('data/distrito.csv'); // <-- Singular y sin barra inicial
      
      // Aseguramos que el código sea string
      const distritosProcesados = data.map(d => ({
          ...d,
          codDistr: String(d.codDistr)
      }));
      
      setDistritos(distritosProcesados);
    } catch (error) {
      console.error('Error al cargar los distritos:', error);
    }
  };

  // Carga inicial
  useEffect(() => {
    cargarDistritos();
  }, []);

  // --- (C)REATE y (U)PDATE (Simulado) ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { nomDistr } = formData;

    const idParaGuardar = editingDistrito 
      ? editingDistrito.codDistr 
      : `DIS-${Date.now()}`; // ID temporal simulado

    const nuevoDistrito = {
        codDistr: idParaGuardar,
        nomDistr: nomDistr
    };

    if (editingDistrito) {
        // UPDATE: Actualizamos el array en memoria
        setDistritos(distritos.map(d => d.codDistr === editingDistrito.codDistr ? nuevoDistrito : d));
    } else {
        // CREATE: Agregamos al array en memoria
        setDistritos([...distritos, nuevoDistrito]);
    }
      
    setIsOpen(false);
    setFormData({ nomDistr: '' });
    setEditingDistrito(null);
    alert("Distrito guardado (Simulación en memoria)");
  };

  const handleEdit = (distrito) => {
    setEditingDistrito(distrito);
    setFormData({ nomDistr: distrito.nomDistr });
    setIsOpen(true);
  };

  // --- (D)ELETE (Simulado) ---
  const handleDelete = (codDistr) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este distrito? (Solo visualmente)')) {
       setDistritos(distritos.filter(d => d.codDistr !== codDistr));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-blue-900 text-4xl mb-2">Distritos</h1>
          <p className="text-gray-600">Gestión de distritos (CSV Local)</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { 
            if(!open) { 
                setEditingDistrito(null); 
                setFormData({nomDistr:''}); 
            } 
            setIsOpen(open); 
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
              setEditingDistrito(null);
              setFormData({ nomDistr: '' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Distrito
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-blue-900">
                {editingDistrito ? 'Editar Distrito' : 'Nuevo Distrito'}
              </DialogTitle>
              <DialogDescription>Ingresa el nombre del distrito.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nomDistr">Nombre del Distrito</Label>
                <Input
                  id="nomDistr"
                  value={formData.nomDistr}
                  onChange={(e) => setFormData({ ...formData, nomDistr: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {editingDistrito ? 'Actualizar' : 'Crear'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {distritos.map((distrito) => (
              <TableRow key={distrito.codDistr}>
                <TableCell>{distrito.codDistr}</TableCell>
                <TableCell className="text-blue-900 font-medium">{distrito.nomDistr}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(distrito)}>
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(distrito.codDistr)}>
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