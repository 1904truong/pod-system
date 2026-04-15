import fish1 from "../assets/Fiskeri/image.webp";
import fish2 from "../assets/Fiskeri/2.webp";
import fish3 from "../assets/Fiskeri/3.webp";
import moto1 from "../assets/moto/1.webp";
import moto2 from "../assets/moto/2.webp";
import moto3 from "../assets/moto/3.webp";
import beer1 from "../assets/OI/1.webp";
import beer2 from "../assets/OI/2.webp";
import beer3 from "../assets/OI/3.webp";
import sport1 from "../assets/Sport/1.webp";
import sport2 from "../assets/Sport/2.webp";
import sport3 from "../assets/Sport/3.webp";

// Sweden imports
import seFish1 from "../assets/sweden/1.webp";
import seFish2 from "../assets/sweden/2.webp";
import seFish3 from "../assets/sweden/3.webp";
import seMoto1 from "../assets/sweden/moto_1.webp";
import seMoto2 from "../assets/sweden/moto_2.webp";
import seMoto3 from "../assets/sweden/moto_3.webp";
import seBeer1 from "../assets/sweden/oi_1.webp";
import seBeer2 from "../assets/sweden/oi_2.webp";
import seBeer3 from "../assets/sweden/oi_3.webp";

export const regionData = {
  denmark: {
    labels: ["Fiskeri", "Motorcykel", "Øl", "Sport"],
    products: [
      {
        id: 1001,
        label: "Fiskeri",
        name: "Fiskeri - Bare Et Kast Mere",
        price: "€21.99",
        image: fish1,
        colors: [
          { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#673ab7" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#ffeb3b" }
        ]
      },
      {
        id: 1002,
        label: "Fiskeri",
        name: "Fiskeri Kalder Og Jeg Må Afsted!",
        price: "€22.50",
        image: fish2,
        colors: [
          { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#673ab7" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#ffeb3b" }, { hex: "#000000" }, { hex: "#425c48" }
        ]
      },
      {
        id: 1003,
        label: "Fiskeri",
        name: "Fiskeri Og Øl Det Er Derfor Jeg Er Her",
        price: "€23.99",
        image: fish3,
        colors: [
          { hex: "#000000" }, { hex: "#d32f2f" }, { hex: "#1a4a8d" }, { hex: "#673ab7" }, { hex: "#001f3f" }, { hex: "#28a745" }, { hex: "#1e3d24" }, { hex: "#888888" }, { hex: "#ffeb3b" }, { hex: "#ff5722" }, { hex: "#ffffff" }, { hex: "#ba7f8c" }
        ]
      },
      {
        id: 2001,
        label: "Motorcykel",
        name: "Motocross Kalder Og Jeg Må Afsted!",
        price: "€21.99",
        image: moto1,
        colors: [
          { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#673ab7" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#ffeb3b" }
        ]
      },
      {
        id: 2002,
        label: "Motorcykel",
        name: "Forstyr Mig Ikke Når Motocross",
        price: "€22.95",
        image: moto2,
        colors: [
          { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#888888" }, { hex: "#000000" }
        ]
      },
      {
        id: 2003,
        label: "Motorcykel",
        name: "Forstyr Mig Ikke Når Motogp",
        price: "€24.50",
        image: moto3,
        colors: [
          { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#673ab7" }, { hex: "#001f3f" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#ffeb3b" }, { hex: "#000000" }
        ]
      },
      {
        id: 3001,
        label: "Øl",
        name: "DET ER ØLTID MADAFAKAS!",
        price: "€21.99",
        image: beer1,
        colors: [
          { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#673ab7" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#ffeb3b" }
        ]
      },
      {
        id: 3002,
        label: "Øl",
        name: "HVIS ØL FORLÆNGER LIVET",
        price: "€22.50",
        image: beer2,
        colors: [
          { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#ffeb3b" }, { hex: "#000000" }, { hex: "#425c48" }, { hex: "#ba7f8c" }
        ]
      },
      {
        id: 3003,
        label: "Øl",
        name: "Jeg Tror At Jeg Skal Have En Øl Mere",
        price: "€19.95",
        image: beer3,
        colors: [
          { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#ffeb3b" }, { hex: "#000000" }, { hex: "#425c48" }
        ]
      },
      {
        id: 4001,
        label: "Sport",
        name: "Forstyr Mig Ikke Når Inter Milan",
        price: "€23.99",
        image: sport1,
        colors: [
          { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#000000" }
        ]
      },
      {
        id: 4002,
        label: "Sport",
        name: "Forstyr Mig Ikke Når Ac Milan",
        price: "€23.99",
        image: sport2,
        colors: [
          { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#000000" }
        ]
      },
      {
        id: 4003,
        label: "Sport",
        name: "Forstyr Mig Ikke Når Arsenal",
        price: "€23.99",
        image: sport3,
        colors: [
          { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#673ab7" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#ffeb3b" }
        ]
      },
    ]
  },
  sweden: {
    labels: ["Fiske", "Motorcykel", "Öl"],
    products: [
      {
        id: 5001,
        label: "Fiske",
        name: "Jag Räddar Fisk Från Vattnet Och Öl Från Flaskan",
        price: "€21.99",
        image: seFish1,
        colors: [
          { hex: "#000000" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#1a4a8d" }, { hex: "#673ab7" }, { hex: "#001f3f" }, { hex: "#28a745" }
        ]
      },
      {
        id: 5002,
        label: "Fiske",
        name: "Fiske Är Mitt Liv",
        label_override: "Unisex Classic Hoodie",
        price: "€34.99",
        image: seFish2,
        colors: [
          { hex: "#000000" }, { hex: "#555555" }, { hex: "#e91e63" }, { hex: "#673ab7" }, { hex: "#440000" }, { hex: "#d32f2f" }, { hex: "#28a745" }
        ]
      },
      {
        id: 5003,
        label: "Fiske",
        name: "Fiske Gud Förlåter, Det Gör Inte Jag",
        price: "€21.99",
        image: seFish3,
        colors: [
          { hex: "#000000" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#1a4a8d" }, { hex: "#673ab7" }, { hex: "#001f3f" }, { hex: "#28a745" }
        ]
      },
      {
        id: 6001,
        label: "Motorcykel",
        name: "Motogp Om Du Inte Har Med Dig Öl",
        price: "€21.99",
        image: seMoto1,
        colors: [
          { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#ffeb3b" }, { hex: "#425c48" }
        ]
      },
      {
        id: 6002,
        label: "Motorcykel",
        name: "Varning Stör Mig Inte När Formel 1",
        price: "€22.50",
        image: seMoto2,
        colors: [
          { hex: "#000000" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#1a4a8d" }, { hex: "#673ab7" }, { hex: "#001f3f" }, { hex: "#28a745" }
        ]
      },
      {
        id: 6003,
        label: "Motorcykel",
        name: "Varning Stör Mig Inte När Motogp",
        price: "€22.50",
        image: seMoto3,
        colors: [
          { hex: "#000000" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#1a4a8d" }, { hex: "#673ab7" }, { hex: "#001f3f" }, { hex: "#28a745" }
        ]
      },
      {
        id: 7001,
        label: "Öl",
        name: "Jag Är Pensionär Grillning Öl",
        price: "€21.99",
        image: seBeer1,
        colors: [
          { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#673ab7" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#ffeb3b" }
        ]
      },
      {
        id: 7002,
        label: "Öl",
        name: "Dricka Öl Grilla Och Ta Tupplur",
        price: "€21.99",
        image: seBeer2,
        colors: [
          { hex: "#000000" }, { hex: "#d32f2f" }, { hex: "#1a4a8d" }, { hex: "#673ab7" }, { hex: "#001f3f" }, { hex: "#28a745" }, { hex: "#1e3d24" }
        ]
      },
      {
        id: 7003,
        label: "Öl",
        name: "Jag Vill Bara Dricka Öl",
        price: "€21.99",
        image: seBeer3,
        colors: [
          { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#ffeb3b" }, { hex: "#425c48" }
        ]
      },
    ]
  }
};