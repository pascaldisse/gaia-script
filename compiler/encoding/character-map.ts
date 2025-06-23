/**
 * GaiaScript Character Encoding Map
 * Maps Chinese characters to English equivalents for TypeScript generation
 */

export interface EncodingMap {
    coreWords: Record<string, string>;
    techTerms: Record<string, string>;
    numbers: Record<string, number>;
    symbols: Record<string, string>;
}

export const encodingMap: EncodingMap = {
    // Core Words (核心詞彙)
    coreWords: {
        '的': 'the',
        '之': 'of',
        '和': 'and',
        '至': 'to',
        '一': 'a',
        '在': 'in',
        '是': 'is',
        '你': 'you',
        '都': 'are',
        '為': 'for',
        '它': 'it',
        '與': 'with',
        '上': 'on',
        '這': 'this',
        '但': 'but',
        '她': 'her',
        '或': 'or',
        '他': 'his',
        '將': 'will',
        '能': 'can',
        '有': 'have',
        '所': 'what'
    },

    // Technical Terms (技術術語)
    techTerms: {
        '編': 'build',
        '執': 'execution',
        '令': 'commands',
        '語': 'language',
        '需': 'requirements',
        '總': 'always',
        '用': 'use',
        '碼': 'code',
        '格': 'style',
        '則': 'guidelines',
        '導': 'imports',
        '式': 'formatting',
        '名': 'naming',
        '狀': 'state',
        '宣': 'declaration',
        '錯': 'error',
        '處': 'handling',
        '標': 'standard',
        '專': 'project',
        '結': 'structure',
        '生': 'ecosystem',
        '技': 'technical',
        '規': 'specification',
        '系': 'system',
        '述': 'description',
        '特': 'features',
        '法': 'syntax',
        '數': 'numbers',
        '操': 'operations',
        '層': 'layers'
    },

    // Numbers (數字)
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
    },

    // Symbols (符號)
    symbols: {
        '⟨': 'opening',
        '⟩': 'closing',
        '⊕': 'concatenation',
        '→': 'flow',
        '網': 'network',
        '入': 'input',
        '卷': 'convolution',
        '池': 'pooling',
        '平': 'flatten',
        '密': 'dense',
        '出': 'output',
        '軟': 'softmax'
    }
};

// Reverse mappings for encoding English back to Chinese
export const reverseEncodingMap = {
    coreWords: Object.fromEntries(Object.entries(encodingMap.coreWords).map(([k, v]) => [v, k])),
    techTerms: Object.fromEntries(Object.entries(encodingMap.techTerms).map(([k, v]) => [v, k])),
    numbers: Object.fromEntries(Object.entries(encodingMap.numbers).map(([k, v]) => [v.toString(), k])),
    symbols: Object.fromEntries(Object.entries(encodingMap.symbols).map(([k, v]) => [v, k]))
};

// Helper functions
export function expandChineseText(text: string): string {
    let result = text;
    
    // Replace core words
    for (const [chinese, english] of Object.entries(encodingMap.coreWords)) {
        result = result.replace(new RegExp(chinese, 'g'), english);
    }
    
    // Replace technical terms
    for (const [chinese, english] of Object.entries(encodingMap.techTerms)) {
        result = result.replace(new RegExp(chinese, 'g'), english);
    }
    
    // Replace numbers
    for (const [chinese, number] of Object.entries(encodingMap.numbers)) {
        result = result.replace(new RegExp(chinese, 'g'), number.toString());
    }
    
    return result;
}

export function compressToChineseText(text: string): string {
    let result = text;
    
    // Replace English with Chinese (reverse mapping)
    for (const [english, chinese] of Object.entries(reverseEncodingMap.coreWords)) {
        result = result.replace(new RegExp(`\\b${english}\\b`, 'g'), chinese);
    }
    
    for (const [english, chinese] of Object.entries(reverseEncodingMap.techTerms)) {
        result = result.replace(new RegExp(`\\b${english}\\b`, 'g'), chinese);
    }
    
    for (const [number, chinese] of Object.entries(reverseEncodingMap.numbers)) {
        result = result.replace(new RegExp(`\\b${number}\\b`, 'g'), chinese);
    }
    
    return result;
}