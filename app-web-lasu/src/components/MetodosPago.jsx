import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export function MetodosPago() {
  const [metodos, setMetodos] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingMetodo, setEditingMetodo] = useState(null);
  const [formData, setFormData] = useState({ nomMetodoPago: '' });

  // --- (R)EAD ---
  const cargarMetodos = () => {
    Papa.parse('/data/metodo_pago.csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => setMetodos(results.data),
        error: () => {
            // Fallback si no hay archivo
            setMetodos([
                { idMetodoPago: 1, nomMetodoPago: 'Efectivo' },
                { idMetodoPago: 2, nomMetodoPago: 'Yape' }
            ]);
        }
    });
  };

  useEffect(() => {
    cargarMetodos();
  }, []);

  // --- (C)REATE y (U)PDATE ---
  const handleSubmit = (e) => {
    e.preventDefault();
    const { nomMetodoPago } = formData;

    if (editingMetodo) {
        // Update
        setMetodos(metodos.map(m => m.idMetodoPago === editingMetodo.idMetodoPago ? { ...m, nomMetodoPago } : m));
    } else {
        // Create
        const nuevo = { 
            idMetodoPago: metodos.length + 1, 
            nomMetodoPago 
        };
        setMetodos([...metodos, nuevo]);
    }
      
    setIsOpen(false);
    setFormData({ nomMetodoPago: '' });
    setEditingMetodo(null);
  };

  const handleEdit = (metodo) => {
    setEditingMetodo(metodo);
    setFormData({ nomMetodoPago: metodo.nomMetodoPago });
    setIsOpen(true);
  };

  const handleDelete = (idMetodoPago) => {
    if (window.confirm('¿Eliminar método? (Visualmente)')) {
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
        <Dialog open={isOpen} onOpenChange={(open) => { if(!open) { setEditingMetodo(null); setFormData({nomMetodoPago:''}); } setIsOpen(open); }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { setEditingMetodo(null); setFormData({ nomMetodoPago: '' }); }}>
              <Plus className="h-4 w-4 mr-2" /> Nuevo Método
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-blue-900">
                {editingMetodo ? 'Editar Método' : 'Nuevo Método'}
              </DialogTitle>
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