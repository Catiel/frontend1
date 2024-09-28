import React, { useState, useEffect } from 'react';
import { getData, putData } from '../api/apiService';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function Perfil() {
  const [userData, setUserData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    profilePicture: '',
    role: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await getData('/me');
        const { name, last_name, email, profilePicture, role } = response.data.item;
        setUserData({
          nombre: name,
          apellido: last_name,
          email: email,
          profilePicture: profilePicture,
          role: role
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (message || Object.keys(error).length > 0) {
      const timer = setTimeout(() => {
        setMessage('');
        setError({});
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        name: userData.nombre,
        last_name: userData.apellido,
        email: userData.email
      };
      const response = await putData('/profile', updatedData);
      setMessage(response.message);
      setError({});
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setError(error.response.data.data);
      } else {
        setError({ general: 'An unexpected error occurred.' });
      }
      setMessage('');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-1 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-6 animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <Avatar className="w-24 h-24 mx-auto mb-4">
        <AvatarImage src={userData.profilePicture} alt={`${userData.nombre} ${userData.apellido}`} />
        <AvatarFallback>{userData.nombre.charAt(0)}{userData.apellido.charAt(0)}</AvatarFallback>
      </Avatar>
      <h2 className="text-center text-2xl font-bold mb-2">{userData.nombre} {userData.apellido}</h2>
      {userData.role && (
        <p className="text-center text-gray-500 mb-1">
          {userData.role === 'student' ? 'Estudiante' : userData.role === 'teacher' ? 'Docente' : userData.role}
        </p>
      )}
      <p className="text-center mb-6">{userData.email}</p>

      {/* Notification area */}
      <div className="mb-4">
        {message && (
          <div className="bg-green-500 text-white p-3 rounded-lg shadow-md flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="mr-2" size={20} />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage('')} className="text-white">
              <XCircle size={20} />
            </button>
          </div>
        )}
        {(error.general || error.email) && (
          <div className="bg-red-500 text-white p-3 rounded-lg shadow-md flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="mr-2" size={20} />
              <span>{error.general || error.email}</span>
            </div>
            <button onClick={() => setError({})} className="text-white">
              <XCircle size={20} />
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={userData.nombre}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={userData.apellido}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Correo Electrónico"
          value={userData.email}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded">Guardar Cambios</button>
      </form>
    </div>
  );
}