// infrastructure/ui/content-scripts/product-identifier.ts

export class ProductUrlParser {
  static getMeliItemId(): string | null {
    const url = window.location.href;
    // Sua lógica de Regex
    const itemIdMatch = url.match(/MLB-?(\d+)/i);
    
    return itemIdMatch ? `MLB${itemIdMatch[1]}` : null;
  }
}

// Execução
const itemId = ProductUrlParser.getMeliItemId();
if (itemId) {
    // Chama o Gateway que envia para o Render
    console.log("Encontramos o ID:", itemId);
}