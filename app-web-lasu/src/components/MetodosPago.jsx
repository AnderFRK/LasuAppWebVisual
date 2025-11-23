import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export function MetodosPago() {
  const [metodos, setMetodos] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [editingMetodo, setEditingMetodo] = useState(null);
  const [formData, setFormData] = useState({ nomMetodoPago: '' });

  const fetchCsvData = (path) => {
    const relativePath = path.startsWith('/') ? path.slice(1) : path;
    const url = `${import.meta.env.BASE_URL}${relativePath}`;

    return new Promise((resolve) => {
        Papa.parse(url, {
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

  const cargarMetodos = async () => {
    try {
      const data = await fetchCsvData('data/metodo_pago.csv');
      
      const metodosProcesados = data.map(m => ({
          ...m,
          idMetodoPago: String(m.idMetodoPago)
      }));
      
      setMetodos(metodosProcesados);
    } catch (error) {
      console.error('Error al cargar los métodos de pago:', error);
    }
  };

  useEffect(() => {
    cargarMetodos();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { nomMetodoPago } = formData;

    const idParaGuardar = editingMetodo 
      ? editingMetodo.idMetodoPago 
      : `MPAGO-${Date.now()}`; // ID temporal simulado

    const nuevoMetodo = {
        idMetodoPago: idParaGuardar,
        nomMetodoPago: nomMetodoPago
    };

    if (editingMetodo) {
        setMetodos(metodos.map(m => m.idMetodoPago === editingMetodo.idMetodoPago ? nuevoMetodo : m));
    } else {
        setMetodos([...metodos, nuevoMetodo]);
    }
      
    setIsOpen(false);
    setFormData({ nomMetodoPago: '' });
    setEditingMetodo(null);
    alert("Método de pago guardado (Simulación en memoria)");
  };

  const handleEdit = (metodo) => {
    setEditingMetodo(metodo);
    setFormData({ nomMetodoPago: metodo.nomMetodoPago });
    setIsOpen(true);
  };

  const handleDelete = (idMetodoPago) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este método? (Solo visualmente)')) {
       setMetodos(metodos.filter(m => m.idMetodoPago !== idMetodoPago));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-blue-900 text-4xl mb-2">Métodos de Pago</h1>
          <p className="text-gray-600">Configuración (CSV Local)</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { 
            if(!open) { 
                setEditingMetodo(null); 
                setFormData({nomMetodoPago:''}); 
            } 
            setIsOpen(open); 
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
              setEditingMetodo(null);
              setFormData({ nomMetodoPago: '' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Método
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-blue-900">
                {editingMetodo ? 'Editar Método' : 'Nuevo Método'}
              </DialogTitle>
              <DialogDescription>Ingresa el nombre del método de pago.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nomMetodoPago">Nombre del Método</Label>
                <Input
                  id="nomMetodoPago"
                  value={formData.nomMetodoPago}
                  onChange={(e) => setFormData({ ...formData, nomMetodoPago: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {editingMetodo ? 'Actualizar' : 'Crear'}
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
            {metodos.map((metodo) => (
              <TableRow key={metodo.idMetodoPago}>
                <TableCell>{metodo.idMetodoPago}</TableCell>
                <TableCell className="text-blue-900 font-medium">{metodo.nomMetodoPago}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(metodo)}>
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(metodo.idMetodoPago)}>
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