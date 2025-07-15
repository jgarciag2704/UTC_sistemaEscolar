// src/components/AccessCards.js
import React from 'react';
import card1 from '../assets/img/card1.jpg';
import card2 from '../assets/img/card2.jpg';
import card3 from '../assets/img/card3.jpg';

export default function AccessCards() {
  return (
    <section className="container mt-5">
      <div className="row cards1 justify-content-center">
        {[{
          img: card1,
          title: "Mis Calificaciones",
          text: "Mira las calificaciones que tienes subidas hasta el momento..."
        }, {
          img: card2,
          title: "Consejos",
          text: "Los mejores consejos para potenciar tu eficiencia y tu aprendizaje..."
        }, {
          img: card3,
          title: "Herramientas",
          text: "Aprende a usar las herramientas tecnológicas que necesitas hoy..."
        }].map((card, i) => (
          <div className="card m-4" style={{ width: '18rem' }} key={i}>
            <img src={card.img} className="card-img-top" alt={`card-${i}`} />
            <div className="card-body">
              <h5 className="card-title">{card.title}</h5>
              <p className="card-text">{card.text}</p>
              <a href="#" className="btn btn-primary">Ver Más</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
