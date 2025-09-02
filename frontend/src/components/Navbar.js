import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/img/logo.png';

export default function Navbar({ isAuthenticated, onLogout }) {
  return (
    <nav className="navbar navbar-expand-lg bg-customs1">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img src={logo} alt="logo de universidad" width="50" />
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarScroll">
          <ul className="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll">

            {/* Entrar SOLO si NO está autenticado */}
            {!isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link text-white" to="/login">
                  Entrar
                </Link>
              </li>
            )}

            <li className="nav-item">
              <a className="nav-link text-white" href="#">Contacto</a>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white admin-only" to="/crear-user">Registrar</Link>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle text-white" href="#" data-bs-toggle="dropdown">
                Accesos
              </a>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item admin-only" to="/materias">Materias</Link></li>
                <li><Link className="dropdown-item admin-only" to="/index-user">Usuarios</Link></li>
                <li><Link className="dropdown-item admin-only" to="/calificarAlumnos">Asignar Calificaciones</Link></li>
                <li><a className="dropdown-item alumno-only" href="/calificarAlumnos">Ver Calificaciones</a></li>
              </ul>
            </li>

            {/* Cerrar Sesión SOLO si está autenticado */}
            {isAuthenticated && (
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link text-white"
                  onClick={onLogout}
                  style={{ textDecoration: 'none' }}
                >
                  Cerrar Sesión
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
