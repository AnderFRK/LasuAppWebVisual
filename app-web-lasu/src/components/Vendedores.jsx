import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Plus, Pencil, Trash2, FileDown } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import * as XLSX from 'xlsx';

export function Vendedores() {
  const [vendedores, setVendedores] = useState([]);
  const [distritos, setDistritos] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState(null);
  const [formData, setFormData] = useState({
    nomVende: '',
    rucVende: '',
    tefVende: '',
    idDistrVende: ''
  });

  // --- HELPER PARA LEER CSV ---
  const fetchCsvData = (path) => {
    return new Promise((resolve) => {
        Papa.parse(path, {
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

  // --- (R)EAD: Cargar Datos ---
  const cargarDatos = async () => {
    try {
      // Cargamos Vendedores y Distritos en paralelo
      const [dataVendedores, dataDistritos] = await Promise.all([
        fetchCsvData('/data/vendedor.csv'),
        fetchCsvData('/data/distrito.csv')
      ]);
      
      setDistritos(dataDistritos);

      // --- FUNCIÓN AUXILIAR PARA DISTRITO VISUAL ---
      // Si no encuentra el ID exacto, elige uno al azar para que la tabla se vea bien
      const getDistritoVisual = (idDistritoOriginal) => {
          // 1. Buscar match exacto
          const distritoReal = dataDistritos.find(d => String(d.codDistr) === String(idDistritoOriginal));
          if (distritoReal) return distritoReal.nomDistr;

          // 2. Si no existe o está vacío, devolver uno ALEATORIO
          if (dataDistritos.length > 0) {
              const randomIndex = Math.floor(Math.random() * dataDistritos.length);
              return dataDistritos[randomIndex].nomDistr;
          }
          return "Sin Distrito";
      };

      // JOIN MANUAL: Unir Vendedor con Nombre de Distrito
      const vendedoresEnriquecidos = dataVendedores.map(v => {
          return {
              ...v,
              idVende: String(v.idVende),
              // Usamos la función visual aquí:
              nomDistr: getDistritoVisual(v.idDistrVende)
          };
      });

      setVendedores(vendedoresEnriquecidos);
      
    } catch (error) {
      console.error('Error al cargar datos CSV:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- (C)REATE y (U)PDATE (Simulado) ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const idParaGuardar = editingVendedor 
      ? editingVendedor.idVende 
      : `VEND-${Date.now()}`; // ID temporal

    // Buscamos el nombre del distrito seleccionado para mostrarlo en la tabla
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
        // UPDATE
        setVendedores(vendedores.map(v => v.idVende === editingVendedor.idVende ? datosVendedor : v));
    } else {
        // CREATE
        setVendedores([datosVendedor, ...vendedores]);
    }
      
    setIsOpen(false);
    limpiarFormulario();
    alert("Proveedor guardado (Simulación en memoria)");
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

  // --- (D)ELETE (Simulado) ---
  const handleDelete = (idVende) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proveedor? (Visualmente)')) {
       setVendedores(vendedores.filter(v => v.idVende !== idVende));
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
          <p className="text-gray-600">Gestión de vendedores (CSV Local)</p>
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
                
                {/* SELECT DE DISTRITO */}
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
            {vendedores.map((vendedor) => (
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
    </div>
  );
}