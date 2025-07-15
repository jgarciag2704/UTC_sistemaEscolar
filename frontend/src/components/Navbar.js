// src/components/Navbar.js
import React from 'react';
import logo from '../assets/img/logo.png'; // Asegúrate de mover tu imagen aquí

export default function Navbar({ onLoginClick })  {
  return (
    <nav className="navbar navbar-expand-lg bg-customs1">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <img src={logo} alt="logo de universidad" width="50" />
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarScroll">
          <ul className="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll">
            <li className="nav-item">
              <button className="nav-link btn btn-link text-white" onClick={onLoginClick}>
            Entrar
          </button>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="#">Contacto</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white admin-only" href="#">Registrar</a>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle text-white" href="#" data-bs-toggle="dropdown">
                Accesos
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item admin-only" href="#">Materias</a></li>
                <li><a className="dropdown-item admin-only" href="#">Usuarios</a></li>
                <li><a className="dropdown-item admin-only" href="#">Asignar Calificaciones</a></li>
                <li><a className="dropdown-item alumno-only" href="#">Ver Calificaciones</a></li>
              </ul>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white logout-only" href="#">Cerrar Sesión</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
