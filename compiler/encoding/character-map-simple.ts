/**
 * GaiaScript Character Encoding Map - Simplified Version
 * Maps between GaiaScript symbols and their expanded forms
 */

export interface EncodingMap {
    keywords: Record<string, string>;
    symbols: Record<string, string>;
    numbers: Record<string, number>;
}

export const encodingMap: EncodingMap = {
    // Basic keyword mappings
    keywords: {
        '函': 'function',
        '變': 'variable',
        '常': 'constant',
        '類': 'class',
        '狀': 'state',
        '組': 'component',
        '界': 'interface',
        '樣': 'style',
        '導': 'import',
        '型': 'type',
        '模': 'module',
        '空': 'namespace'
    },
    
    // Symbol mappings
    symbols: {
        'λ': 'lambda',
        'Σ': 'sigma',
        'Ω': 'omega',
        'Δ': 'delta',
        'Φ': 'phi',
        'Ψ': 'psi',
        '∅': 'empty',
        '∞': 'infinity',
        '⊕': 'plus',
        '⊗': 'times',
        '→': 'arrow',
        '⇒': 'implies'
    },
    
    // Number mappings
    numbers: {
        '零': 0,
        '一': 1,
        '二': 2,
        '三': 3,
        '四': 4,
        '五': 5,
        '六': 6,
        '七': 7,
        '八': 8,
        '九': 9
    }
};

// Simple text expansion function
export function expandText(text: string): string {
    let result = text;
    
    // Expand keywords
    for (const [gaia, expanded] of Object.entries(encodingMap.keywords)) {
        result = result.replace(new RegExp(gaia, 'g'), expanded);
    }
    
    // Expand symbols
    for (const [symbol, name] of Object.entries(encodingMap.symbols)) {
        result = result.replace(new RegExp(`\\${symbol}`, 'g'), name);
    }
    
    return result;
}

// Simple text compression function
export function compressText(text: string): string {
    let result = text;
    
    // Compress keywords
    for (const [gaia, expanded] of Object.entries(encodingMap.keywords)) {
        result = result.replace(new RegExp(`\\b${expanded}\\b`, 'g'), gaia);
    }
    
    return result;
}

// Number encoding function
export function encodeNumber(num: number): string {
    const digitMap = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    
    if (num >= 0 && num <= 9) {
        return digitMap[num];
    }
    
    return num.toString(); // Fallback for larger numbers
}

// Number decoding function
export function decodeNumber(encoded: string): number {
    if (encoded in encodingMap.numbers) {
        return encodingMap.numbers[encoded];
    }
    
    return parseInt(encoded, 10); // Fallback
}

// For compatibility with existing code
export const αText = expandText;
export const ψText = compressText;
export const χNumber = encodeNumber;
export const ωNumber = decodeNumber;