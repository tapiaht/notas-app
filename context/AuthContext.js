import React, { createContext, useState } from "react";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [rude_rda, setRude_rda] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState(null);  // Nuevo estado

  const login = (usuario) => {
    setUsuario(usuario);
    setTipoUsuario(usuario.tipo); // Guardamos si es "alumno" o "docente"
    setRude_rda(usuario.rude_rda);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUsuario(null);
    setTipoUsuario(null);
    setIsAuthenticated(false);
    setRude_rda(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated,setIsAuthenticated, usuario, tipoUsuario,rude_rda, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
