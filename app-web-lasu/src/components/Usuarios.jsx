import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({ nombreUsu: '', contraseñaUsu: '' });

  // --- (R)EAD: Cargar usuarios desde JSON local (Corregido para GitHub Pages) ---
  const cargarUsuarios = async () => {
    try {
      // CORRECCIÓN: Usamos import.meta.env.BASE_URL para la ruta correcta en deploy
      const response = await fetch(`${import.meta.env.BASE_URL}data/usuario.json`);
      
      if (!response.ok) throw new Error("No se pudo leer el archivo JSON");
      
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar los usuarios:', error);
    }
  };

  // CARGAR LOS USUARIOS AL INICIAR
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // --- (C)REATE y (U)PDATE (Simulado) ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación: Si crea, contraseña obligatoria
    if (!editingUsuario && !formData.contraseñaUsu) {
      alert('La contraseña es obligatoria para crear un nuevo usuario.');
      return;
    }

    const idParaGuardar = editingUsuario 
      ? editingUsuario.idUsuario 
      : String(Date.now()); // ID temporal simulado

    // Si edita y deja la contraseña en blanco, mantenemos la vieja
    const passFinal = editingUsuario && formData.contraseñaUsu === '' 
        ? editingUsuario.contraseñaUsu 
        : formData.contraseñaUsu;

    const datosUsuario = {
      idUsuario: idParaGuardar,
      nombreUsu: formData.nombreUsu,
      contraseñaUsu: passFinal
    };

    if (editingUsuario) {
      // UPDATE: Actualizamos el array en memoria
      setUsuarios(usuarios.map(u => u.idUsuario === editingUsuario.idUsuario ? datosUsuario : u));
    } else {
      // CREATE: Agregamos al array en memoria
      setUsuarios([...usuarios, datosUsuario]);
    }
      
    setIsOpen(false);
    setFormData({ nombreUsu: '', contraseñaUsu: '' });
    setEditingUsuario(null);
    alert("Usuario guardado (Simulación en memoria)");
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    // Dejamos contraseña vacía para no mostrarla, si el usuario escribe algo se cambia
    setFormData({ nombreUsu: usuario.nombreUsu, contraseñaUsu: '' }); 
    setIsOpen(true);
  };

  // --- (D)ELETE (Simulado) ---
  const handleDelete = (idUsuario) => {
    // Evitar que el admin '1' o 'admin' se auto-elimine (basado en tu json)
    if (idUsuario === '1' || idUsuario === 'admin') {
      alert('No puedes eliminar al usuario administrador principal.');
      return;
    }
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? (Visualmente)')) {
       // Filtramos el array para quitar el usuario
       setUsuarios(usuarios.filter(u => u.idUsuario !== idUsuario));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-blue-900 text-4xl mb-2">Usuarios</h1>
          <p className="text-gray-600">Gestión de usuarios (Cargado desde JSON)</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
            if(!open) {
                setEditingUsuario(null);
                setFormData({ nombreUsu: '', contraseñaUsu: '' });
            }
            setIsOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
              setEditingUsuario(null);
              setFormData({ nombreUsu: '', contraseñaUsu: '' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-blue-900">
                {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombreUsu">Nombre de Usuario</Label>
                <Input
                  id="nombreUsu"
                  value={formData.nombreUsu}
                  onChange={(e) => setFormData({ ...formData, nombreUsu: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contraseñaUsu">
                  {editingUsuario ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
                </Label>
                <Input
                  id="contraseñaUsu"
                  type="password"
                  value={formData.contraseñaUsu}
                  onChange={(e) => setFormData({ ...formData, contraseñaUsu: e.target.value })}
                  // 'required' solo se aplica si NO estamos editando
                  required={!editingUsuario} 
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {editingUsuario ? 'Actualizar' : 'Crear'}
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
              <TableHead>Nombre de Usuario</TableHead>
              <TableHead>Contraseña</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.idUsuario}>
                <TableCell>{usuario.idUsuario}</TableCell>
                <TableCell className="text-blue-900 font-medium">{usuario.nombreUsu}</TableCell>
                <TableCell>{"********"}</TableCell> 
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(usuario)}>
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    {/* El admin id '1' no se borra */}
                    {usuario.idUsuario !== '1' && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(usuario.idUsuario)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
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