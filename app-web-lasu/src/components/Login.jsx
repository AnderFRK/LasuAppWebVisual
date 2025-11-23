import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react'; 
import logoLASU from '../assets/LASU-BLUE2.png'; 

export function Login({ onLogin }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regId, setRegId] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); 
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/data/usuario.json');
      
      if (!response.ok) {
        throw new Error('No se pudo cargar el archivo de usuarios.');
      }

      const usuarios = await response.json();

      const usuarioEncontrado = usuarios.find(
        u => u.nombreUsu === loginUsername && u.contraseñaUsu === loginPassword
      );

      if (usuarioEncontrado) {
        localStorage.setItem('usuarioActivo', JSON.stringify(usuarioEncontrado));
        onLogin(); 
      } else {
        setError('Usuario o contraseña incorrectos.');
      }

    } catch (err) {
      console.error(err);
      setError('Error al conectar con la base de datos local.');
    }
  };

  // --- LÓGICA DE REGISTRAR (SIMULADO) ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (regPassword !== regConfirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setTimeout(() => {
        setSuccess('¡Usuario registrado con éxito! (Simulación: Usa "admin" / "123" para entrar)');
        setIsLoginView(true);
        setLoginUsername(regId); 
        setLoginPassword('');
        
        setRegId('');
        setRegNombre('');
        setRegPassword('');
        setRegConfirmPassword('');
    }, 1000);
  };
  
  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError(null);
    setSuccess(null);
  }

  return (
    <div className="flex min-h-screen bg-white">
      
      {/* Columna Izquierda (Diseño y Logo) */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-blue-900 p-12">
        <div className="flex flex-col items-center text-center">
          <img src={logoLASU} alt="Logo Ferretería LASU" className="w-48 h-auto mb-8" />
          <h1 className="text-3xl font-bold text-white">
            Sistema de Gestión LASU
          </h1>
          <p className="text-blue-200 mt-2">
            Prototipo Visual - Datos CSV/JSON
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-blue-900">
              {isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isLoginView ? 'Ingresa tus credenciales para acceder.' : 'Completa el formulario para registrarte.'}
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-6 bg-green-50 border-green-600 text-green-900">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          {isLoginView ? (
            
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="text-gray-900">Usuario</Label>
                <Input
                  id="login-username"
                  type="text"
                  placeholder="ej: admin"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  className="h-10 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-gray-900">Contraseña</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="h-10 text-base"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-base">
                Entrar
              </Button>
            </form>

          ) : (

            // --- FORMULARIO DE REGISTRO ---
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-id" className="text-gray-900">Usuario (ID)</Label>
                <Input
                  id="reg-id"
                  type="text"
                  placeholder="El usuario para login"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  required
                  className="h-10 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-nombre" className="text-gray-900">Nombre Completo</Label>
                <Input
                  id="reg-nombre"
                  type="text"
                  placeholder="Tu nombre y apellido"
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  required
                  className="h-10 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-gray-900">Contraseña</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  className="h-10 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-confirm-password" className="text-gray-900">Confirmar Contraseña</Label>
                <Input
                  id="reg-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                  className="h-10 text-base"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-base">
                Crear Cuenta (Simulado)
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <Button variant="link" onClick={toggleView} className="text-blue-600">
              {isLoginView 
                ? '¿No tienes cuenta? Regístrate'
                : '¿Ya tienes cuenta? Inicia Sesión'
              }
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}