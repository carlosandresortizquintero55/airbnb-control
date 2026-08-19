// Plantilla de inventario que parte igual en todas las propiedades.
// Cantidad por defecto en 0: el admin solo tiene que ajustar lo que aplica
// (ej. dejar en 0 los tamaños de cama que no existen en esa propiedad).
export const DEFAULT_INVENTORY_TEMPLATE: Array<{
  category: string;
  name: string;
}> = [
  // Dormitorio
  { category: "Dormitorio", name: "Cama King (190)" },
  { category: "Dormitorio", name: "Cama Queen (160)" },
  { category: "Dormitorio", name: "Cama Doble (140)" },
  { category: "Dormitorio", name: "Cama Sencilla/Twin (120)" },
  { category: "Dormitorio", name: "Juego de sábana" },
  { category: "Dormitorio", name: "Sobrecama" },
  { category: "Dormitorio", name: "Toallas grandes" },
  { category: "Dormitorio", name: "Toallas pequeñas" },

  // Sala
  { category: "Sala", name: "Sofá" },

  // Cocina y menaje
  { category: "Cocina y menaje", name: "Abrelatas" },
  { category: "Cocina y menaje", name: "Tabla para picar" },
  { category: "Cocina y menaje", name: "Destapacorchos" },
  { category: "Cocina y menaje", name: "Rallador" },
  { category: "Cocina y menaje", name: "Cuchillos de cocina" },
  { category: "Cocina y menaje", name: "Cucharas" },
  { category: "Cocina y menaje", name: "Tenedores" },
  { category: "Cocina y menaje", name: "Cuchillos (cubiertos)" },
  { category: "Cocina y menaje", name: "Utensilios de cocina (varios)" },
  { category: "Cocina y menaje", name: "Horno tostador" },
  { category: "Cocina y menaje", name: "Microondas" },
  { category: "Cocina y menaje", name: "Ollas" },
  { category: "Cocina y menaje", name: "Cafetera" },
  { category: "Cocina y menaje", name: "Sandwichera" },
  { category: "Cocina y menaje", name: "Exprimidor de jugos" },
  { category: "Cocina y menaje", name: "Airfryer" },
  { category: "Cocina y menaje", name: "Copas de vino" },

  // Baño
  { category: "Baño", name: "Secador de pelo" },

  // Lavandería
  { category: "Lavandería", name: "Plancha" },
  { category: "Lavandería", name: "Mesa de planchar" },
  { category: "Lavandería", name: "Armario para secar ropa" },
  { category: "Lavandería", name: "Detergente líquido (se deja)" },
  { category: "Lavandería", name: "Aromatizante (se deja)" },

  // Electrónica / Seguridad
  { category: "Electrónica", name: "Chapa electrónica de puerta" },
  { category: "Electrónica", name: "Control de aire acondicionado" },
  { category: "Electrónica", name: "Control de TV" },
  { category: "Electrónica", name: "Control de ventilador" },
  { category: "Electrónica", name: "Control de cortinas" },

  // Climatización
  { category: "Climatización", name: "Aire acondicionado" },
  { category: "Climatización", name: "Jacuzzi" },
  { category: "Climatización", name: "Calentador de agua a gas" },
];

export const DEFAULT_MAINTENANCE_TYPES: string[] = [
  "Fumigación",
  "Pilas – Chapa electrónica",
  "Pilas – Control aire acondicionado",
  "Pilas – Control TV",
  "Pilas – Control ventilador",
  "Pilas – Control cortinas",
  "Mantenimiento aire acondicionado",
  "Mantenimiento jacuzzi",
  "Mantenimiento calentador de agua a gas",
];
