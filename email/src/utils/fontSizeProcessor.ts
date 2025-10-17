
/**
 * Utilitário para processar HTML e aplicar font-size
 */

export function applyFontSizeToHtml(htmlContent: string, fontSize: string): string {
  if (!htmlContent || !fontSize) {
    return htmlContent;
  }

  console.log('🎨 Aplicando font-size ao HTML:', { fontSize, contentLength: htmlContent.length });

  // Criar um elemento temporário para processar o HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Função recursiva para aplicar font-size a todos os elementos de texto
  const applyFontSizeRecursively = (element: Element) => {
    // Aplicar font-size ao elemento atual se ele tem conteúdo de texto
    if (element.textContent && element.textContent.trim()) {
      (element as HTMLElement).style.fontSize = fontSize;
    }

    // Aplicar recursivamente aos filhos
    Array.from(element.children).forEach(child => {
      applyFontSizeRecursively(child);
    });
  };

  // Aplicar font-size a todos os elementos
  Array.from(tempDiv.children).forEach(child => {
    applyFontSizeRecursively(child);
  });

  // Se não há elementos filhos, aplicar diretamente ao container
  if (tempDiv.children.length === 0 && tempDiv.textContent) {
    tempDiv.style.fontSize = fontSize;
  }

  const processedHtml = tempDiv.innerHTML;
  console.log('✅ HTML processado com font-size aplicado');
  
  return processedHtml;
}

export function wrapHtmlWithFontSize(htmlContent: string, fontSize: string): string {
  if (!htmlContent || !fontSize) {
    return htmlContent;
  }

  // Envolver o HTML em um div com font-size aplicado
  return `<div style="font-size: ${fontSize}; line-height: 1.6;">${htmlContent}</div>`;
}

export function extractFontSizeFromHtml(htmlContent: string): string | null {
  if (!htmlContent) return null;

  // Tentar extrair font-size de elementos com estilo inline
  const fontSizeMatch = htmlContent.match(/font-size:\s*([^;]+)/i);
  return fontSizeMatch ? fontSizeMatch[1].trim() : null;
}
