import { PrismaClient, ProductType } from '@prisma/client'

// Definición de tipos para los catálogos de productos
interface ProductSeed {
  name: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  type: ProductType;
}

// Catálogo de productos por categoría
const productCatalog: Record<string, ProductSeed[]> = {
  'Cervezas': [
    { name: 'Corona', purchasePrice: 5.99, salePrice: 7.79, stock: 24, type: ProductType.ALCOHOLIC },
    { name: 'Heineken', purchasePrice: 5.49, salePrice: 7.14, stock: 18, type: ProductType.ALCOHOLIC },
    { name: 'Stella Artois', purchasePrice: 6.99, salePrice: 9.09, stock: 15, type: ProductType.ALCOHOLIC },
    { name: 'Budweiser', purchasePrice: 4.99, salePrice: 6.49, stock: 30, type: ProductType.ALCOHOLIC },
    { name: 'Modelo Especial', purchasePrice: 5.79, salePrice: 7.53, stock: 22, type: ProductType.ALCOHOLIC },
    { name: 'Pilsener', purchasePrice: 3.99, salePrice: 5.19, stock: 35, type: ProductType.ALCOHOLIC },
    { name: 'Club Colombia', purchasePrice: 4.50, salePrice: 5.85, stock: 28, type: ProductType.ALCOHOLIC },
    { name: 'Aguila', purchasePrice: 3.50, salePrice: 4.55, stock: 40, type: ProductType.ALCOHOLIC },
    { name: 'Blue Moon', purchasePrice: 6.50, salePrice: 8.45, stock: 18, type: ProductType.ALCOHOLIC },
    { name: 'Guinness', purchasePrice: 7.99, salePrice: 10.39, stock: 15, type: ProductType.ALCOHOLIC },
    { name: 'Pale Ale IPA', purchasePrice: 7.50, salePrice: 9.75, stock: 20, type: ProductType.ALCOHOLIC },
    { name: 'Cerveza Artesanal Local', purchasePrice: 8.99, salePrice: 11.69, stock: 12, type: ProductType.ALCOHOLIC },
    { name: 'Cerveza Sin Alcohol', purchasePrice: 4.99, salePrice: 6.49, stock: 15, type: ProductType.NON_ALCOHOLIC },
    { name: 'Cerveza de Trigo', purchasePrice: 6.75, salePrice: 8.78, stock: 14, type: ProductType.ALCOHOLIC },
    { name: 'Cerveza Negra', purchasePrice: 7.25, salePrice: 9.43, stock: 16, type: ProductType.ALCOHOLIC },
    { name: 'Cerveza Roja', purchasePrice: 7.10, salePrice: 9.23, stock: 17, type: ProductType.ALCOHOLIC },
    { name: 'Porter', purchasePrice: 7.40, salePrice: 9.62, stock: 15, type: ProductType.ALCOHOLIC },
    { name: 'Stout', purchasePrice: 7.60, salePrice: 9.88, stock: 13, type: ProductType.ALCOHOLIC },
    { name: 'Lager Premium', purchasePrice: 8.20, salePrice: 10.66, stock: 14, type: ProductType.ALCOHOLIC },
    { name: 'Michelada', purchasePrice: 8.50, salePrice: 11.05, stock: 22, type: ProductType.ALCOHOLIC },
  ],
  'Licores': [
    { name: 'Jack Daniels', purchasePrice: 27.99, salePrice: 35.99, stock: 12, type: ProductType.ALCOHOLIC },
    { name: 'Absolut Vodka', purchasePrice: 22.99, salePrice: 28.99, stock: 15, type: ProductType.ALCOHOLIC },
    { name: 'Johnnie Walker Red', purchasePrice: 25.99, salePrice: 32.49, stock: 10, type: ProductType.ALCOHOLIC },
    { name: 'Bacardi Blanco', purchasePrice: 19.99, salePrice: 25.99, stock: 18, type: ProductType.ALCOHOLIC },
    { name: 'Tequila José Cuervo', purchasePrice: 23.99, salePrice: 29.99, stock: 14, type: ProductType.ALCOHOLIC },
    { name: 'Gin Tanqueray', purchasePrice: 26.99, salePrice: 33.99, stock: 9, type: ProductType.ALCOHOLIC },
    { name: 'Havana Club 7 Años', purchasePrice: 29.50, salePrice: 37.50, stock: 8, type: ProductType.ALCOHOLIC },
    { name: 'Hennessy VS', purchasePrice: 39.99, salePrice: 49.99, stock: 6, type: ProductType.ALCOHOLIC },
    { name: 'Chivas Regal 12', purchasePrice: 35.99, salePrice: 45.99, stock: 7, type: ProductType.ALCOHOLIC },
    { name: 'Malibu', purchasePrice: 17.50, salePrice: 22.50, stock: 12, type: ProductType.ALCOHOLIC },
    { name: 'Jagermeister', purchasePrice: 20.99, salePrice: 26.99, stock: 10, type: ProductType.ALCOHOLIC },
    { name: 'Ciroc', purchasePrice: 33.99, salePrice: 42.99, stock: 7, type: ProductType.ALCOHOLIC },
    { name: 'Grey Goose', purchasePrice: 35.99, salePrice: 45.99, stock: 6, type: ProductType.ALCOHOLIC },
    { name: 'Macallan 12', purchasePrice: 69.99, salePrice: 85.99, stock: 4, type: ProductType.ALCOHOLIC },
    { name: 'Don Julio Reposado', purchasePrice: 42.99, salePrice: 52.99, stock: 5, type: ProductType.ALCOHOLIC },
    { name: 'Baileys', purchasePrice: 19.99, salePrice: 24.99, stock: 9, type: ProductType.ALCOHOLIC },
    { name: 'Martini Bianco', purchasePrice: 14.99, salePrice: 18.99, stock: 11, type: ProductType.ALCOHOLIC },
    { name: 'Aperol', purchasePrice: 17.99, salePrice: 22.99, stock: 8, type: ProductType.ALCOHOLIC },
    { name: 'Campari', purchasePrice: 18.50, salePrice: 23.50, stock: 8, type: ProductType.ALCOHOLIC },
    { name: 'Disaronno Amaretto', purchasePrice: 20.50, salePrice: 26.50, stock: 7, type: ProductType.ALCOHOLIC },
  ],
  'Snaks': [
    { name: 'Nachos', purchasePrice: 3.99, salePrice: 4.99, stock: 20, type: ProductType.NON_ALCOHOLIC },
    { name: 'Papas Fritas', purchasePrice: 2.99, salePrice: 3.99, stock: 25, type: ProductType.NON_ALCOHOLIC },
    { name: 'Doritos', purchasePrice: 3.50, salePrice: 4.50, stock: 22, type: ProductType.NON_ALCOHOLIC },
    { name: 'Cheetos', purchasePrice: 2.75, salePrice: 3.75, stock: 28, type: ProductType.NON_ALCOHOLIC },
    { name: 'Galletas Saladas', purchasePrice: 1.99, salePrice: 2.99, stock: 30, type: ProductType.NON_ALCOHOLIC },
    { name: 'Maní', purchasePrice: 2.25, salePrice: 3.25, stock: 35, type: ProductType.NON_ALCOHOLIC },
    { name: 'Mix de Frutos Secos', purchasePrice: 4.99, salePrice: 5.99, stock: 18, type: ProductType.NON_ALCOHOLIC },
    { name: 'Palomitas', purchasePrice: 2.50, salePrice: 3.50, stock: 25, type: ProductType.NON_ALCOHOLIC },
    { name: 'Aceitunas', purchasePrice: 3.25, salePrice: 4.25, stock: 15, type: ProductType.NON_ALCOHOLIC },
    { name: 'Chips de Plátano', purchasePrice: 2.99, salePrice: 3.99, stock: 22, type: ProductType.NON_ALCOHOLIC },
    { name: 'Papas Onduladas', purchasePrice: 3.25, salePrice: 4.25, stock: 24, type: ProductType.NON_ALCOHOLIC },
    { name: 'Pretzels', purchasePrice: 2.80, salePrice: 3.80, stock: 20, type: ProductType.NON_ALCOHOLIC },
    { name: 'Bolas de Queso', purchasePrice: 3.50, salePrice: 4.50, stock: 18, type: ProductType.NON_ALCOHOLIC },
    { name: 'Snack Mix', purchasePrice: 4.25, salePrice: 5.25, stock: 15, type: ProductType.NON_ALCOHOLIC },
    { name: 'Galletas de Chocolate', purchasePrice: 3.75, salePrice: 4.75, stock: 22, type: ProductType.NON_ALCOHOLIC },
    { name: 'Nueces Garapiñadas', purchasePrice: 4.50, salePrice: 5.50, stock: 12, type: ProductType.NON_ALCOHOLIC },
    { name: 'Chips de Maíz', purchasePrice: 2.99, salePrice: 3.99, stock: 24, type: ProductType.NON_ALCOHOLIC },
    { name: 'Chicharrones', purchasePrice: 3.25, salePrice: 4.25, stock: 20, type: ProductType.NON_ALCOHOLIC },
    { name: 'Mix de Galletas', purchasePrice: 3.99, salePrice: 4.99, stock: 18, type: ProductType.NON_ALCOHOLIC },
    { name: 'Palitos de Queso', purchasePrice: 3.50, salePrice: 4.50, stock: 20, type: ProductType.NON_ALCOHOLIC },
  ],
  'Gaseosas': [
    { name: 'Coca Cola', purchasePrice: 1.49, salePrice: 2.49, stock: 30, type: ProductType.NON_ALCOHOLIC },
    { name: 'Sprite', purchasePrice: 1.49, salePrice: 2.49, stock: 25, type: ProductType.NON_ALCOHOLIC },
    { name: 'Fanta', purchasePrice: 1.49, salePrice: 2.49, stock: 20, type: ProductType.NON_ALCOHOLIC },
    { name: 'Pepsi', purchasePrice: 1.39, salePrice: 2.39, stock: 28, type: ProductType.NON_ALCOHOLIC },
    { name: '7Up', purchasePrice: 1.39, salePrice: 2.39, stock: 22, type: ProductType.NON_ALCOHOLIC },
    { name: 'Dr Pepper', purchasePrice: 1.59, salePrice: 2.59, stock: 18, type: ProductType.NON_ALCOHOLIC },
    { name: 'Mountain Dew', purchasePrice: 1.59, salePrice: 2.59, stock: 20, type: ProductType.NON_ALCOHOLIC },
    { name: 'Coca Cola Zero', purchasePrice: 1.49, salePrice: 2.49, stock: 25, type: ProductType.NON_ALCOHOLIC },
    { name: 'Sprite Zero', purchasePrice: 1.49, salePrice: 2.49, stock: 20, type: ProductType.NON_ALCOHOLIC },
    { name: 'Agua Mineral', purchasePrice: 0.99, salePrice: 1.99, stock: 35, type: ProductType.NON_ALCOHOLIC },
    { name: 'Agua Tónica', purchasePrice: 1.79, salePrice: 2.79, stock: 18, type: ProductType.NON_ALCOHOLIC },
    { name: 'Soda', purchasePrice: 0.89, salePrice: 1.89, stock: 20, type: ProductType.NON_ALCOHOLIC },
    { name: 'Limonada', purchasePrice: 2.25, salePrice: 3.25, stock: 15, type: ProductType.NON_ALCOHOLIC },
    { name: 'Jugo de Naranja', purchasePrice: 2.50, salePrice: 3.50, stock: 15, type: ProductType.NON_ALCOHOLIC },
    { name: 'Té Helado', purchasePrice: 2.25, salePrice: 3.25, stock: 18, type: ProductType.NON_ALCOHOLIC },
    { name: 'Gatorade', purchasePrice: 2.49, salePrice: 3.49, stock: 20, type: ProductType.NON_ALCOHOLIC },
    { name: 'Red Bull', purchasePrice: 3.99, salePrice: 4.99, stock: 15, type: ProductType.NON_ALCOHOLIC },
    { name: 'Monster', purchasePrice: 3.75, salePrice: 4.75, stock: 15, type: ProductType.NON_ALCOHOLIC },
    { name: 'Jugo de Manzana', purchasePrice: 2.25, salePrice: 3.25, stock: 12, type: ProductType.NON_ALCOHOLIC },
    { name: 'Bebida de Coco', purchasePrice: 2.99, salePrice: 3.99, stock: 10, type: ProductType.NON_ALCOHOLIC },
  ],
  'Miscelánea': [
    { name: 'Chicles', purchasePrice: 0.99, salePrice: 1.99, stock: 50, type: ProductType.NON_ALCOHOLIC },
    { name: 'Caramelos', purchasePrice: 0.75, salePrice: 1.75, stock: 60, type: ProductType.NON_ALCOHOLIC },
    { name: 'Chocolate', purchasePrice: 1.99, salePrice: 2.99, stock: 40, type: ProductType.NON_ALCOHOLIC },
    { name: 'Pastillas de Menta', purchasePrice: 0.50, salePrice: 1.50, stock: 45, type: ProductType.NON_ALCOHOLIC },
    { name: 'Chocolatina', purchasePrice: 1.75, salePrice: 2.25, stock: 35, type: ProductType.NON_ALCOHOLIC },
    { name: 'Barra Energética', purchasePrice: 2.75, salePrice: 3.50, stock: 25, type: ProductType.NON_ALCOHOLIC },
    { name: 'Paletas', purchasePrice: 0.99, salePrice: 1.25, stock: 40, type: ProductType.NON_ALCOHOLIC },
    { name: 'Gomitas', purchasePrice: 1.99, salePrice: 2.50, stock: 30, type: ProductType.NON_ALCOHOLIC },
    { name: 'Galletas', purchasePrice: 2.39, salePrice: 2.99, stock: 30, type: ProductType.NON_ALCOHOLIC },
    { name: 'Alfajores', purchasePrice: 2.59, salePrice: 3.25, stock: 20, type: ProductType.NON_ALCOHOLIC },
    { name: 'Barras de Cereal', purchasePrice: 2.19, salePrice: 2.75, stock: 28, type: ProductType.NON_ALCOHOLIC },
    { name: 'Brownie', purchasePrice: 2.79, salePrice: 3.50, stock: 15, type: ProductType.NON_ALCOHOLIC },
    { name: 'Cookies', purchasePrice: 2.39, salePrice: 2.99, stock: 22, type: ProductType.NON_ALCOHOLIC },
    { name: 'Muffin', purchasePrice: 2.99, salePrice: 3.75, stock: 12, type: ProductType.NON_ALCOHOLIC },
    { name: 'Bombones', purchasePrice: 3.59, salePrice: 4.50, stock: 18, type: ProductType.NON_ALCOHOLIC },
    { name: 'Wafer', purchasePrice: 1.59, salePrice: 1.99, stock: 25, type: ProductType.NON_ALCOHOLIC },
    { name: 'Malvaviscos', purchasePrice: 1.99, salePrice: 2.50, stock: 20, type: ProductType.NON_ALCOHOLIC },
    { name: 'Merengues', purchasePrice: 2.19, salePrice: 2.75, stock: 15, type: ProductType.NON_ALCOHOLIC },
    { name: 'Nougat', purchasePrice: 3.19, salePrice: 3.99, stock: 12, type: ProductType.NON_ALCOHOLIC },
    { name: 'Dulce de Leche', purchasePrice: 3.59, salePrice: 4.50, stock: 10, type: ProductType.NON_ALCOHOLIC },
  ],
  'Cigarrería': [
    { name: 'Marlboro Rojo', purchasePrice: 7.19, salePrice: 8.99, stock: 40, type: ProductType.NON_ALCOHOLIC },
    { name: 'Marlboro Gold', purchasePrice: 7.19, salePrice: 8.99, stock: 35, type: ProductType.NON_ALCOHOLIC },
    { name: 'Camel', purchasePrice: 6.80, salePrice: 8.50, stock: 30, type: ProductType.NON_ALCOHOLIC },
    { name: 'Lucky Strike', purchasePrice: 7.00, salePrice: 8.75, stock: 28, type: ProductType.NON_ALCOHOLIC },
    { name: 'Winston', purchasePrice: 6.39, salePrice: 7.99, stock: 25, type: ProductType.NON_ALCOHOLIC },
    { name: 'Pall Mall', purchasePrice: 6.00, salePrice: 7.50, stock: 30, type: ProductType.NON_ALCOHOLIC },
    { name: 'Belmont', purchasePrice: 6.20, salePrice: 7.75, stock: 28, type: ProductType.NON_ALCOHOLIC },
    { name: 'Dunhill', purchasePrice: 7.60, salePrice: 9.50, stock: 20, type: ProductType.NON_ALCOHOLIC },
    { name: 'Chesterfield', purchasePrice: 5.80, salePrice: 7.25, stock: 22, type: ProductType.NON_ALCOHOLIC },
    { name: 'L&M', purchasePrice: 6.39, salePrice: 7.99, stock: 25, type: ProductType.NON_ALCOHOLIC },
    { name: 'Viceroy', purchasePrice: 6.00, salePrice: 7.50, stock: 20, type: ProductType.NON_ALCOHOLIC },
    { name: 'Newport', purchasePrice: 6.60, salePrice: 8.25, stock: 18, type: ProductType.NON_ALCOHOLIC },
    { name: 'Kool', purchasePrice: 6.80, salePrice: 8.50, stock: 15, type: ProductType.NON_ALCOHOLIC },
    { name: 'Benson & Hedges', purchasePrice: 7.40, salePrice: 9.25, stock: 12, type: ProductType.NON_ALCOHOLIC },
    { name: 'Virginia Slims', purchasePrice: 7.00, salePrice: 8.75, stock: 10, type: ProductType.NON_ALCOHOLIC },
    { name: 'Kent', purchasePrice: 7.19, salePrice: 8.99, stock: 14, type: ProductType.NON_ALCOHOLIC },
    { name: 'Parliament', purchasePrice: 7.60, salePrice: 9.50, stock: 12, type: ProductType.NON_ALCOHOLIC },
    { name: 'Salem', purchasePrice: 6.60, salePrice: 8.25, stock: 14, type: ProductType.NON_ALCOHOLIC },
    { name: 'Roth', purchasePrice: 6.52, salePrice: 8.15, stock: 16, type: ProductType.NON_ALCOHOLIC },
    { name: 'Clipper', purchasePrice: 6.39, salePrice: 7.99, stock: 18, type: ProductType.NON_ALCOHOLIC },
  ],
  'Cacharrería': [
    { name: 'Cargador USB', purchasePrice: 10.39, salePrice: 12.99, stock: 15, type: ProductType.NON_ALCOHOLIC },
    { name: 'Audífonos', purchasePrice: 15.99, salePrice: 19.99, stock: 10, type: ProductType.NON_ALCOHOLIC },
    { name: 'Batería Externa', purchasePrice: 19.99, salePrice: 24.99, stock: 8, type: ProductType.NON_ALCOHOLIC },
    { name: 'Cable USB Tipo C', purchasePrice: 7.99, salePrice: 9.99, stock: 12, type: ProductType.NON_ALCOHOLIC },
    { name: 'Cable Lightning', purchasePrice: 11.99, salePrice: 14.99, stock: 10, type: ProductType.NON_ALCOHOLIC },
    { name: 'Adaptador de Corriente', purchasePrice: 9.59, salePrice: 11.99, stock: 10, type: ProductType.NON_ALCOHOLIC },
    { name: 'Tarjeta de Memoria', purchasePrice: 15.19, salePrice: 18.99, stock: 8, type: ProductType.NON_ALCOHOLIC },
    { name: 'Llavero', purchasePrice: 4.79, salePrice: 5.99, stock: 20, type: ProductType.NON_ALCOHOLIC },
    { name: 'Encendedor', purchasePrice: 2.80, salePrice: 3.50, stock: 30, type: ProductType.NON_ALCOHOLIC },
    { name: 'Portallaves', purchasePrice: 6.39, salePrice: 7.99, stock: 15, type: ProductType.NON_ALCOHOLIC },
    { name: 'Soporte para Celular', purchasePrice: 11.99, salePrice: 14.99, stock: 8, type: ProductType.NON_ALCOHOLIC },
    { name: 'Funda para Celular', purchasePrice: 13.59, salePrice: 16.99, stock: 12, type: ProductType.NON_ALCOHOLIC },
    { name: 'Protector de Pantalla', purchasePrice: 7.99, salePrice: 9.99, stock: 15, type: ProductType.NON_ALCOHOLIC },
    { name: 'Batería AA (Par)', purchasePrice: 3.99, salePrice: 4.99, stock: 25, type: ProductType.NON_ALCOHOLIC },
    { name: 'Batería AAA (Par)', purchasePrice: 3.99, salePrice: 4.99, stock: 25, type: ProductType.NON_ALCOHOLIC },
    { name: 'Linterna LED', purchasePrice: 10.39, salePrice: 12.99, stock: 10, type: ProductType.NON_ALCOHOLIC },
    { name: 'Mini Altavoz', purchasePrice: 23.99, salePrice: 29.99, stock: 6, type: ProductType.NON_ALCOHOLIC },
    { name: 'Tijeras', purchasePrice: 4.79, salePrice: 5.99, stock: 15, type: ProductType.NON_ALCOHOLIC },
    { name: 'Agenda de Bolsillo', purchasePrice: 7.19, salePrice: 8.99, stock: 10, type: ProductType.NON_ALCOHOLIC },
    { name: 'Lapicero', purchasePrice: 2.39, salePrice: 2.99, stock: 30, type: ProductType.NON_ALCOHOLIC },
  ],
};

/**
 * Genera objetos de productos para insertar en la base de datos
 * @param prisma Instancia de PrismaClient
 * @param categories Categorías disponibles en la base de datos
 * @returns Array de productos listos para insertar
 */
export async function generateProducts(
  prisma: PrismaClient,
  categories: { id: string; name: string }[]
) {
  // Productos a insertar
  const productsToInsert = [];
  
  // Para cada categoría
  for (const category of categories) {
    const categoryName = category.name;
    const categoryId = category.id;
    
    // Si existe el catálogo para esta categoría
    if (productCatalog[categoryName]) {
      // Agregar todos los productos del catálogo para esta categoría
      for (const product of productCatalog[categoryName]) {
        productsToInsert.push({
          name: product.name,
          purchasePrice: product.purchasePrice,
          salePrice: product.salePrice,
          stock: product.stock,
          minStock: 20, // Valor predeterminado para todos los productos
          type: product.type,
          categoryId: categoryId
        });
      }
    }
  }
  
  // Crear todos los productos
  console.log(`🔄 Insertando ${productsToInsert.length} productos...`);
  
  // Insertar productos en grupos de 20 para mejor rendimiento
  const batchSize = 20;
  const batches = [];
  
  for (let i = 0; i < productsToInsert.length; i += batchSize) {
    const batch = productsToInsert.slice(i, i + batchSize);
    batches.push(batch);
  }
  
  const products = [];
  
  for (const [index, batch] of batches.entries()) {
    console.log(`🔄 Insertando batch ${index + 1}/${batches.length}...`);
    
    const batchResults = await Promise.all(
      batch.map(product => prisma.product.create({ data: product }))
    );
    
    products.push(...batchResults);
  }
  
  return products;
}