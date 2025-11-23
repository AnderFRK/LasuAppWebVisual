import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Plus, Pencil, Trash2, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import * as XLSX from 'xlsx';

export function Vendedores() {
  const [vendedores, setVendedores] = useState([]);
  const [distritos, setDistritos] = useState([]);

  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(20);

  const [isOpen, setIsOpen] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState(null);
  const [formData, setFormData] = useState({
    nomVende: '',
    rucVende: '',
    tefVende: '',
    idDistrVende: ''
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
      const [dataVendedores, dataDistritos] = await Promise.all([
        fetchCsvData('data/vendedor.csv'),
        fetchCsvData('data/distrito.csv') 
      ]);
      
      setDistritos(dataDistritos);

      const vendedoresEnriquecidos = dataVendedores.map(v => {
          const distrito = dataDistritos.find(d => String(d.codDistr) === String(v.idDistrVende));
          return {
              ...v,
              idVende: String(v.idVende),
              nomDistr: distrito ? distrito.nomDistr : 'Sin Distrito'
          };
      });

      // Ordenar por ID si es posible
      vendedoresEnriquecidos.sort((a, b) => Number(a.idVende) - Number(b.idVende));
      setVendedores(vendedoresEnriquecidos);
      
    } catch (error) {
      console.error('Error al cargar datos CSV:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- LÓGICA DE PAGINACIÓN ---
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const vendedoresVisibles = vendedores.slice(indicePrimerItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(vendedores.length / itemsPorPagina);
  const cambiarPagina = (n) => setPaginaActual(n);

  // --- (C)REATE y (U)PDATE ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const idParaGuardar = editingVendedor 
      ? editingVendedor.idVende 
      : `VEND-${Date.now()}`; 

    const distritoObj = distritos.find(d => String(d.codDistr) === String(formData.idDistrVende));

    const datosVendedor = {
      idVende: idParaGuardar,
      nomVende: formData.nomVende,
      rucVende: formData.rucVende,
      tefVende: formData.tefVende,
      idDistrVende: formData.idDistrVende,
      nomDistr: distritoObj ? distritoObj.nomDistr : '...'
    };

    if (editingVendedor) {
        setVendedores(vendedores.map(v => v.idVende === editingVendedor.idVende ? datosVendedor : v));
    } else {
        setVendedores([datosVendedor, ...vendedores]);
    }
      
    setIsOpen(false);
    limpiarFormulario();
  };

  const handleEdit = (vendedor) => {
    setEditingVendedor(vendedor);
    setFormData({
      nomVende: vendedor.nomVende,
      rucVende: String(vendedor.rucVende || ''),
      tefVende: String(vendedor.tefVende || ''),
      idDistrVende: String(vendedor.idDistrVende || '')
    });
    setIsOpen(true);
  };

  const handleDelete = (idVende) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proveedor? (Visualmente)')) {
       const nuevos = vendedores.filter(v => v.idVende !== idVende);
       setVendedores(nuevos);
       if (nuevos.slice(indicePrimerItem, indiceUltimoItem).length === 0 && paginaActual > 1) {
           setPaginaActual(paginaActual - 1);
       }
    }
  };

  const limpiarFormulario = () => {
      setEditingVendedor(null);
      setFormData({ nomVende: '', rucVende: '', tefVende: '', idDistrVende: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-blue-900 text-4xl mb-2">Proveedores</h1>
          <p className="text-gray-600">
            Gestión de vendedores (Mostrando {vendedoresVisibles.length} de {vendedores.length})
          </p>
        </div>
        <div className="flex gap-2">
            <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                    const hoja = XLSX.utils.json_to_sheet(vendedores);
                    const libro = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(libro, hoja, "Proveedores");
                    XLSX.writeFile(libro, "proveedores.xlsx");
                }}
            >
                <FileDown className="h-4 w-4 mr-2" /> Exportar
            </Button>

            <Dialog open={isOpen} onOpenChange={(open) => { if(!open) limpiarFormulario(); setIsOpen(open); }}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" /> Nuevo Proveedor
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                <DialogTitle className="text-blue-900">
                    {editingVendedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </DialogTitle>
                <DialogDescription>Ingresa los datos del proveedor.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="nomVende">Nombre del Proveedor</Label>
                    <Input
                        id="nomVende"
                        value={formData.nomVende}
                        onChange={(e) => setFormData({ ...formData, nomVende: e.target.value })}
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="rucVende">RUC</Label>
                        <Input
                            id="rucVende"
                            value={formData.rucVende}
                            onChange={(e) => setFormData({ ...formData, rucVende: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="tefVende">Teléfono</Label>
                        <Input
                            id="tefVende"
                            value={formData.tefVende}
                            onChange={(e) => setFormData({ ...formData, tefVende: e.target.value })}
                        />
                    </div>
                </div>
                
                <div>
                    <Label htmlFor="idDistrVende">Distrito</Label>
                    <Select 
                        value={formData.idDistrVende} 
                        onValueChange={(value) => setFormData({ ...formData, idDistrVende: value })}
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

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    {editingVendedor ? 'Actualizar' : 'Guardar'}
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
              <TableHead>Nombre del Proveedor</TableHead>
              <TableHead>RUC</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Distrito</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendedoresVisibles.map((vendedor) => (
              <TableRow key={vendedor.idVende}>
                <TableCell>{vendedor.idVende}</TableCell>
                <TableCell className="text-blue-900 font-medium">{vendedor.nomVende}</TableCell>
                <TableCell>{vendedor.rucVende || '-'}</TableCell>
                <TableCell>{vendedor.tefVende || '-'}</TableCell>
                <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                        {vendedor.nomDistr}
                    </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(vendedor)}>
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(vendedor.idVende)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {vendedores.length > 0 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 border-t rounded-lg shadow">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indicePrimerItem + 1}</span> a <span className="font-medium">{Math.min(indiceUltimoItem, vendedores.length)}</span> de <span className="font-medium">{vendedores.length}</span> resultados
                </span>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1} className="flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" /> Ant.
                </Button>
                <span className="text-sm font-medium px-2 flex items-center">Pág {paginaActual}/{totalPaginas}</span>
                <Button variant="outline" size="sm" onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} className="flex items-center gap-1">
                    Sig. <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
          </div>
      )}
    </div>
  );
}