import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';

export function Duenos() {
  // 1. Estado inicial vacío
  const [duenos, setDuenos] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [editingDueno, setEditingDueno] = useState(null);
  const [formData, setFormData] = useState({ 
    nombreDue: '', 
    DescNegocio: '', 
    DueRuc: '', 
    DueTel: '', 
    DueDirec: '' 
  });

  const cargarDuenos = async () => {
    try {
      const respuesta = await fetch('/data/dueno.json');
      if (!respuesta.ok) throw new Error("No se pudo leer el archivo JSON");
      
      const data = await respuesta.json();
      setDuenos(data);
    } catch (error) {
      console.error('Error al cargar los dueños:', error);
    }
  };

  useEffect(() => {
    cargarDuenos();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const idParaGuardar = editingDueno 
      ? editingDueno.idDueno 
      : `DUENO-${Date.now()}`; // ID temporal simulado

    const datosDueno = {
      ...formData,
      idDueno: idParaGuardar 
    };

    if (editingDueno) {
      // UPDATE: Actualizamos el array en memoria
      setDuenos(duenos.map(d => d.idDueno === editingDueno.idDueno ? datosDueno : d));
    } else {
      // CREATE: Agregamos al array en memoria
      setDuenos([...duenos, datosDueno]);
    }
      
    setIsOpen(false);
    setFormData({ nombreDue: '', DescNegocio: '', DueRuc: '', DueTel: '', DueDirec: '' });
    setEditingDueno(null);
    
    alert('Datos guardados (Simulación en memoria)');
  };

  const handleEdit = (dueno) => {
    setEditingDueno(dueno);
    setFormData({ 
      nombreDue: dueno.nombreDue, 
      DescNegocio: dueno.DescNegocio,
      DueRuc: dueno.DueRuc, 
      DueTel: dueno.DueTel,
      DueDirec: dueno.DueDirec
    });
    setIsOpen(true);
  };

  // --- (D)ELETE (Simulado) ---
  const handleDelete = (idDueno) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta información de dueño? (Visualmente)')) {
       // Filtramos el array local
       setDuenos(duenos.filter(d => d.idDueno !== idDueno));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-blue-900 text-4xl mb-2">Dueños</h1>
          <p className="text-gray-600">Información del dueño</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                setEditingDueno(null);
                setFormData({ nombreDue: '', DescNegocio: '', DueRuc: '', DueTel: '', DueDirec: '' });
            }
            setIsOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
              setEditingDueno(null);
              setFormData({ nombreDue: '', DescNegocio: '', DueRuc: '', DueTel: '', DueDirec: '' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Dueño
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-blue-900">
                {editingDueno ? 'Editar Dueño' : 'Nuevo Dueño'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombreDue">Nombre</Label>
                <Input
                  id="nombreDue"
                  value={formData.nombreDue}
                  onChange={(e) => setFormData({ ...formData, nombreDue: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="DescNegocio">Descripción del Negocio</Label>
                <Textarea
                  id="DescNegocio"
                  value={formData.DescNegocio}
                  onChange={(e) => setFormData({ ...formData, DescNegocio: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="DueRuc">RUC</Label>
                    <Input
                    id="DueRuc"
                    value={formData.DueRuc}
                    onChange={(e) => setFormData({ ...formData, DueRuc: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="DueTel">Teléfono</Label>
                    <Input
                    id="DueTel"
                    value={formData.DueTel}
                    onChange={(e) => setFormData({ ...formData, DueTel: e.target.value })}
                    />
                </div>
              </div>
              <div>
                <Label htmlFor="DueDirec">Dirección</Label>
                <Textarea
                  id="DueDirec"
                  value={formData.DueDirec}
                  onChange={(e) => setFormData({ ...formData, DueDirec: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {editingDueno ? 'Actualizar' : 'Crear'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción Negocio</TableHead>
              <TableHead>RUC</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {duenos.map((dueno) => (
              <TableRow key={dueno.idDueno}>
                <TableCell>{dueno.idDueno}</TableCell>
                <TableCell className="text-blue-900 font-medium">{dueno.nombreDue}</TableCell>
                <TableCell className="max-w-xs truncate" title={dueno.DescNegocio}>{dueno.DescNegocio}</TableCell>
                <TableCell>{dueno.DueRuc}</TableCell>
                <TableCell>{dueno.DueTel}</TableCell>
                <TableCell className="max-w-xs truncate" title={dueno.DueDirec}>{dueno.DueDirec}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(dueno)}>
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(dueno.idDueno)}>
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