import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Plus, Pencil, Trash2, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import * as XLSX from 'xlsx';

export function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [distritos, setDistritos] = useState([]); 

  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(20);

  const [isOpen, setIsOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  
  const [formData, setFormData] = useState({
    nomCliente: '',
    rucCliente: '',
    tefCliente: '',
    refCliente: '',
    idDistrCliente: ''
  });

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
      const [dataClientes, dataDistritos] = await Promise.all([
        fetchCsvData('data/cliente.csv'),
        fetchCsvData('data/distrito.csv') 
      ]);
      
      setDistritos(dataDistritos);

      const clientesEnriquecidos = dataClientes.map(c => {
          const distrito = dataDistritos.find(d => String(d.codDistr) === String(c.idDistrCliente));
          return {
              ...c,
              nomDistr: distrito ? distrito.nomDistr : 'Sin Distrito'
          };
      });

      // Ordenar por ID descendente
      clientesEnriquecidos.sort((a, b) => b.idCliente - a.idCliente);
      setClientes(clientesEnriquecidos);
      
    } catch (error) {
      console.error('Error al cargar datos CSV:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const clientesVisibles = clientes.slice(indicePrimerItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(clientes.length / itemsPorPagina);

  const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  // --- (C)REATE y (U)PDATE ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const idParaGuardar = editingCliente 
      ? editingCliente.idCliente 
      : clientes.length + 1001; 

    const distritoObj = distritos.find(d => String(d.codDistr) === String(formData.idDistrCliente));

    const datosCliente = {
      idCliente: idParaGuardar,
      nomCliente: formData.nomCliente,
      rucCliente: formData.rucCliente,
      tefCliente: formData.tefCliente,
      refCliente: formData.refCliente,
      idDistrCliente: formData.idDistrCliente,
      nomDistr: distritoObj ? distritoObj.nomDistr : '...'
    };

    if (editingCliente) {
        setClientes(clientes.map(c => c.idCliente === editingCliente.idCliente ? datosCliente : c));
    } else {
        // Al crear, agregamos al principio del array global
        setClientes([datosCliente, ...clientes]);
    }
      
    setIsOpen(false);
    limpiarFormulario();
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nomCliente: cliente.nomCliente,
      rucCliente: String(cliente.rucCliente || ''),
      tefCliente: String(cliente.tefCliente || ''),
      refCliente: cliente.refCliente || '',
      idDistrCliente: String(cliente.idDistrCliente || '')
    });
    setIsOpen(true);
  };

  // --- (D)ELETE ---
  const handleDelete = (idCliente) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente? (Visualmente)')) {
       const nuevosClientes = clientes.filter(c => c.idCliente !== idCliente);
       setClientes(nuevosClientes);
       
       // Si vaciamos la página actual, retrocedemos
       const itemsEnPaginaActual = nuevosClientes.slice(indicePrimerItem, indiceUltimoItem);
       if (itemsEnPaginaActual.length === 0 && paginaActual > 1) {
           setPaginaActual(paginaActual - 1);
       }
    }
  };

  const limpiarFormulario = () => {
      setEditingCliente(null);
      setFormData({ nomCliente: '', rucCliente: '', tefCliente: '', refCliente: '', idDistrCliente: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-blue-900 text-4xl mb-2">Clientes</h1>
          <p className="text-gray-600">
            Gestión de clientes (Mostrando {clientesVisibles.length} de {clientes.length})
          </p>
        </div>
        <div className="flex gap-2">
            <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                const hoja = XLSX.utils.json_to_sheet(clientes);
                const libro = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(libro, hoja, "Clientes");
                XLSX.writeFile(libro, "clientes.xlsx");
                }}
            >
                <FileDown className="h-4 w-4 mr-2" />
                Exportar
            </Button>

            <Dialog open={isOpen} onOpenChange={(open) => { if(!open) limpiarFormulario(); setIsOpen(open); }}>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cliente
            </Button>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                <DialogTitle className="text-blue-900">
                    {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                </DialogTitle>
                <DialogDescription>Completa la información del cliente.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                    <Label htmlFor="nomCliente">Nombre del Cliente / Razón Social</Label>
                    <Input
                    id="nomCliente"
                    value={formData.nomCliente}
                    onChange={(e) => setFormData({ ...formData, nomCliente: e.target.value })}
                    required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="rucCliente">RUC / DNI</Label>
                        <Input
                        id="rucCliente"
                        value={formData.rucCliente}
                        onChange={(e) => setFormData({ ...formData, rucCliente: e.target.value })}
                        maxLength={11}
                        />
                    </div>
                    <div>
                        <Label htmlFor="tefCliente">Teléfono</Label>
                        <Input
                        id="tefCliente"
                        value={formData.tefCliente}
                        onChange={(e) => setFormData({ ...formData, tefCliente: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="idDistrCliente">Distrito</Label>
                        <Select 
                            value={formData.idDistrCliente} 
                            onValueChange={(value) => setFormData({ ...formData, idDistrCliente: value })}
                        >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar distrito" />
                        </SelectTrigger>
                        <SelectContent>
                            {distritos.map(d => (
                            <SelectItem key={d.codDistr} value={String(d.codDistr)}>{d.nomDistr}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="refCliente">Referencia / Dirección</Label>
                        <Input
                        id="refCliente"
                        value={formData.refCliente}
                        onChange={(e) => setFormData({ ...formData, refCliente: e.target.value })}
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    {editingCliente ? 'Actualizar' : 'Guardar'}
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
              <TableHead>Nombre</TableHead>
              <TableHead>RUC/DNI</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Distrito</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          {/* Mapeamos solo los VISIBLES */}
          <TableBody>
            {clientesVisibles.map((cliente) => (
              <TableRow key={cliente.idCliente}>
                <TableCell>{cliente.idCliente}</TableCell>
                <TableCell className="text-blue-900 font-medium">{cliente.nomCliente}</TableCell>
                <TableCell>{cliente.rucCliente || '-'}</TableCell>
                <TableCell>{cliente.tefCliente || '-'}</TableCell>
                <TableCell className="max-w-xs truncate" title={cliente.refCliente}>{cliente.refCliente}</TableCell>
                <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                        {cliente.nomDistr}
                    </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(cliente)}>
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cliente.idCliente)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {clientesVisibles.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No hay clientes registrados.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- CONTROLES DE PAGINACIÓN --- */}
      {clientes.length > 0 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 border-t rounded-lg shadow">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indicePrimerItem + 1}</span> a <span className="font-medium">{Math.min(indiceUltimoItem, clientes.length)}</span> de <span className="font-medium">{clientes.length}</span> resultados
                </span>
            </div>
            <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => cambiarPagina(paginaActual - 1)} 
                    disabled={paginaActual === 1}
                    className="flex items-center gap-1"
                >
                    <ChevronLeft className="h-4 w-4" /> Anterior
                </Button>
                
                <span className="text-sm font-medium px-2 flex items-center">
                    Pág {paginaActual} / {totalPaginas}
                </span>

                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => cambiarPagina(paginaActual + 1)} 
                    disabled={paginaActual === totalPaginas}
                    className="flex items-center gap-1"
                >
                    Siguiente <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
          </div>
      )}
    </div>
  );
}