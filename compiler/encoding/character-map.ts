/**
 * 地λ LLM-Optimized Mathematical Encoding Map
 * Ultra-efficient single-token mathematical symbols for optimal LLM processing
 */

export interface ΨMap {
    λ: Record<string, string>;     // mathematical core constructs
    ℝ: Record<string, string>;     // mathematical data types  
    ∇: Record<string, string>;     // mathematical control flow
    ρ: Record<string, string>;     // mathematical CSS properties
    Ξ: Record<string, string>;     // mathematical operations
    𝔸: Record<string, number>;     // unicode numeric encoding
}

export const ψMap: ΨMap = {
    // Strategic Mixed System: Symbols for programming + Chinese for words
    λ: {
        // ALL Programming concepts → Universal mathematical/symbolic
        '函': 'λ',    // function → lambda (universal CS symbol)
        '變': '∆',    // variable/change → delta (mathematical change)
        '常': 'π',    // constant → pi (mathematical constant)
        '類': 'Σ',    // class/type → sigma (collection/sum)
        '狀': 'Σ',    // state → sigma (state collection)
        '組': '∆',    // component → delta (building block)
        '界': 'Ω',    // interface → omega (boundary/scope)
        '樣': 'Φ',    // style → phi (golden ratio/proportion)
        '導': 'Ψ',    // import → psi (transformation/wave)
        '型': 'Τ',    // type → tau (type/classification)
        '模': 'Μ',    // module → mu (module/measure)
        '空': '∅',    // namespace → empty set (container)
        
        // Pure language words → Chinese (semantic meaning)
        '詞': '詞',    // word (language concept)
        '句': '句',    // sentence (language concept)
        '意': '意',    // meaning (semantic concept)
        '話': '話',    // speech/talk (communication)
        '字': '字',    // character (writing concept)
        
        // Programming concepts that were missed → symbols
        '名': 'ι',    // name → iota (identifier)
        '值': 'ν',    // value → nu (content/value)
        
        // Programming actions → Mathematical/symbolic
        '碼': '⊕',    // code → direct sum (combination)
        '編': '∏',    // compile → product (assembly)
        '執': '∫',    // execute → integral (process)
        '跑': '→',    // run → arrow (flow)
        '建': '∪',    // build → union (assembly)
        '測': '⊨',    // test → satisfies (validation)
        '調': '∂',    // debug → partial (analysis)
        
        // Error/status → Symbols  
        '錯': '⊥',    // error → bottom (failure)
        '好': '⊤',    // success → top (success)
        '停': '□',    // stop → box (halt)
        '續': '◇',    // continue → diamond (proceed)
        
        // Control flow → Mathematical logic symbols
        '如': '∇',    // if → nabla (condition)
        '則': '→',    // then → arrow (implication)
        '或': '∨',    // or → logical or
        '且': '∧',    // and → logical and
        '非': '¬',    // not → logical negation
        '為': '∀',    // for/forall → universal quantifier
        '存': '∃',    // exists → existential quantifier
        '當': '◯',    // while → circle (cycle)
        '迴': '↻',    // loop → circular arrow
        '返': '↩',    // return → return arrow
        
        // Operations → Mathematical operators
        '合': '∘',    // compose → composition
        '映': '↦',    // map → maps to
        '積': '∫',    // integrate/accumulate → integral
        '和': '∑',    // sum → summation
        '乘': '∏',    // product → product symbol
        '選': '∇',    // select → nabla (gradient)
        '濾': '∇',    // filter → nabla (selective)
        '歸': '∑',    // reduce → summation
    },

    // Data Types: Math symbols for programming types, Chinese for words
    ℝ: {
        // ALL Programming data types → Mathematical sets/symbols
        '文': '𝕊',    // string → string set
        '列': '𝔸',    // array → array set  
        '物': '𝕆',    // object → object set
        '數': 'ℝ',    // number → real numbers
        '整': 'ℤ',    // integer → integers
        '自': 'ℕ',    // natural → natural numbers
        '複': 'ℂ',    // complex → complex numbers
        '布': '𝔹',    // boolean → boolean set
        '圖': 'Γ',    // graph → gamma (graph theory)
        '表': '⊞',    // table → squared plus (tabular)
        '集': '∈',    // set → element of (set membership)
        '映': '↦',    // function → maps to arrow
        
        // Pure language/communication concepts → Chinese (semantic words only)
        '詞': '詞',    // word (pure language concept)
        '語': '語',    // speech (pure language concept)
        '話': '話',    // talk (pure communication concept)
        '字': '字',    // character (pure writing concept)
        
        // Special programming values → Math symbols
        '真': '⊤',    // true → top
        '假': '⊥',    // false → bottom
        '空': '∅',    // empty → empty set
        '無': '∅',    // null → empty set
        '無限': '∞',  // infinity → infinity symbol
        '未定': '?',  // undefined → question mark
    },

    // Mathematical Control Flow (Logic & Flow Symbols)
    ∇: {
        '如': '∇',    // if/gradient (nabla - condition)
        '則': '→',    // then/flow (right arrow)
        '否': '¬',    // else/not (logical negation)
        '且': '∧',    // and (logical and)
        '或': '∨',    // or (logical or)
        '非': '¬',    // not (logical negation)
        '當': '∀',    // while/forall (universal quantifier)
        '對': '∂',    // for/partial (partial derivative)
        '回': '↩',    // return (return arrow)
        '跳': '⇒',    // jump/implies (logical implication)
        '迴': '∫',    // loop/integral (integration over range)
        '停': '⊥',    // stop/bottom (mathematical bottom)
    },

    // Mathematical CSS Properties (Greek Letters - Single Tokens)
    ρ: {
        'color': 'ρ',           // rho (density/color)
        'border': 'β',          // beta (boundary)
        'padding': 'φ',         // phi (golden ratio/spacing)
        'margin': 'μ',          // mu (margin/measure)
        'display': 'δ',         // delta (change/display)
        'transition': 'τ',      // tau (time/transition) 
        'transform': 'Υ',       // upsilon (transformation)
        'position': 'π',        // pi (position/place)
        'width': 'ω',           // omega (width/end)
        'height': 'η',          // eta (height)
        'opacity': 'α',         // alpha (transparency)
        'z-index': 'ζ',         // zeta (z-order)
        'font-size': 'σ',       // sigma (size)
        'font-weight': 'κ',     // kappa (weight)
        'text-align': 'χ',      // chi (alignment)
        'line-height': 'λ',     // lambda (line height)
        'letter-spacing': 'ψ',  // psi (letter spacing)
        'word-spacing': 'ξ',    // xi (word spacing)
        'text-decoration': 'ε', // epsilon (decoration)
        'text-transform': 'θ',  // theta (transform)
        'vertical-align': 'ν',  // nu (vertical align)
        'white-space': 'ι',     // iota (white space)
        'overflow': 'γ',        // gamma (overflow)
        'visibility': 'υ',      // upsilon (visibility)
        'cursor': 'ς',          // final sigma (cursor)
        'outline': 'ο',         // omicron (outline)
        'box-shadow': 'Σ',      // capital sigma (shadow)
        'border-radius': 'Ρ',   // capital rho (radius)
        'background': 'Β',      // capital beta (background)
        'background-color': 'Γ', // capital gamma (bg color)
        'background-image': 'Δ', // capital delta (bg image)
        'background-size': 'Ε', // capital epsilon (bg size)
        'background-position': 'Ζ', // capital zeta (bg position)
        'background-repeat': 'Η', // capital eta (bg repeat)
        'min-width': 'Θ',       // capital theta (min width)
        'max-width': 'Ι',       // capital iota (max width)
        'min-height': 'Κ',      // capital kappa (min height)
        'max-height': 'Λ',      // capital lambda (max height)
        'flex-direction': 'Μ',  // capital mu (flex direction)
        'flex-wrap': 'Ν',       // capital nu (flex wrap)
        'justify-content': 'Ξ', // capital xi (justify content)
        'align-items': 'Ο',     // capital omicron (align items)
        'align-content': 'Π',   // capital pi (align content)
        'flex': '☰',           // trigram (flexible)
        'grid': '⊞',           // squared plus (grid)
        'center': '◐',         // half circle (center)
        'none': '⊥',           // bottom (none)
        'auto': '∞',           // infinity (auto)
        'solid': '⬛',         // black square (solid)
        'pointer': '☝',        // pointing finger (pointer)
        'bold': '⚡',          // lightning (bold/strong)
        
        // Additional CSS values with mathematical symbols
        'block': '⊞',          // square (block)
        'inline': '—',         // horizontal line (inline)
        'absolute': '⊙',       // circle with dot (absolute position)
        'relative': '◯',       // circle (relative position)
        'fixed': '⬟',          // pentagon (fixed)
        'hidden': '⊗',         // tensor cross (hidden)
        'visible': '◉',        // filled circle (visible)
        'transparent': '◯',     // empty circle (transparent)
        'inherit': '↑',        // up arrow (inherit)
        'initial': '◦',        // bullet (initial)
        'left': '←',           // left arrow
        'right': '→',          // right arrow
        'top': '↑',            // up arrow
        'bottom': '↓',         // down arrow
        'justify': '≡',        // identical (justify)
        'baseline': '⌐',       // baseline symbol
        'middle': '⊙',         // center dot (middle)
        'nowrap': '∞',         // infinity (no wrap)
        'wrap': '∿',           // sine wave (wrap)
        'uppercase': '△',       // triangle up (uppercase)
        'lowercase': '▽',       // triangle down (lowercase)
        'capitalize': '◬',      // square with dot (capitalize)
    },

    // Mathematical Operations (Mathematical Operators)
    Ξ: {
        'function': 'λ',        // lambda (function)
        'component': '∆',       // delta (component)
        'interface': 'Ω',       // omega (interface)
        'state': 'Σ',          // sigma (state/sum)
        'style': 'Φ',          // phi (style)
        'string': '𝕊',         // string set
        'array': '𝔸',          // array set
        'object': '𝕆',         // object set
        'number': 'ℝ',         // real numbers
        'boolean': '𝔹',        // boolean set
        'rgba': 'ρ',           // rho (color function)
        'linear-gradient': '∇', // gradient (nabla)
        'translateY': 'Υ',      // upsilon (Y-transform)
        'rotate': '∘',         // composition (rotation)
        'scale': '⊗',          // tensor product (scale)
        'map': '∘',            // composition (map)
        'filter': '∇',         // gradient (filter)
        'reduce': 'Σ',         // sigma (sum/reduce)
        'forEach': '∀',        // forall (forEach)
        'push': '⊕',          // direct sum (push/add)
        'pop': '⊖',           // minus (pop/remove)
        'length': '|',         // absolute value bars (length)
        'equals': '≡',         // identical (strict equals)
        'contains': '∈',       // element of (contains)
        'typeof': '∈',         // element of (type membership)
    },

    // Vector-Based Number System - Revolutionary LLM Efficiency
    // ALL numbers represented by single tensor symbol ⊗ + vector operations
    𝔸: {
        // Base Vector System: ⊗[operation] encodes any number
        // ⊗ = tensor product symbol (universal mathematical operator)
        // Vector basis: ∅(0), α(1), β(2), γ(3), δ(4), ε(5), ζ(6), η(7), θ(8), ι(9)
        
        // Single digit vectors (0-9) - Most common in programming
        '⊗∅': 0, '⊗α': 1, '⊗β': 2, '⊗γ': 3, '⊗δ': 4, 
        '⊗ε': 5, '⊗ζ': 6, '⊗η': 7, '⊗θ': 8, '⊗ι': 9,
        
        // Decimal powers via vector multiplication (10^n)
        '⊗χ': 10,     // chi = 10^1  
        '⊗ψ': 100,    // psi = 10^2
        '⊗ω': 1000,   // omega = 10^3
        '⊗Α': 10000,  // Alpha = 10^4
        '⊗Β': 100000, // Beta = 10^5
        
        // Composite numbers via vector addition/multiplication
        // Format: ⊗[tens][units] e.g., ⊗χα = 10+1 = 11
        '⊗χα': 11, '⊗χβ': 12, '⊗χγ': 13, '⊗χδ': 14, '⊗χε': 15,
        '⊗χζ': 16, '⊗χη': 17, '⊗χθ': 18, '⊗χι': 19, '⊗ββ': 20,
        '⊗βχ': 21, '⊗γχ': 30, '⊗δχ': 40, '⊗εχ': 50,
        '⊗ζχ': 60, '⊗ηχ': 70, '⊗θχ': 80, '⊗ιχ': 90,
        
        // Mathematical constants as vectors
        '⊗π': Math.PI,   // pi constant
        '⊗e': Math.E,    // euler constant  
        '⊗φ': 1.618,     // golden ratio
        '⊗∞': Infinity,  // infinity
        '⊗∅': 0,         // empty/zero
        
        // Fractional vectors (common programming ratios)
        '⊗½': 0.5,       // half
        '⊗¼': 0.25,      // quarter
        '⊗¾': 0.75,      // three quarters
        '⊗⅓': 0.333,     // third
        '⊗⅔': 0.667,     // two thirds
        
        // Boolean vectors (programming logic)
        '⊗⊤': 1,         // true (top)
        '⊗⊥': 0,         // false (bottom)
        
        // Special programming values
        '⊗◐': 50,        // percent (50%)
        '⊗●': 100,       // full (100%)
        '⊗◯': 0,         // empty circle (0%)
        
        // Negative numbers via vector negation
        '⊗⁻α': -1, '⊗⁻β': -2, '⊗⁻γ': -3, '⊗⁻δ': -4, '⊗⁻ε': -5,
    }
};

// Reverse mappings for decoding
export const φMap = {
    λ: Object.fromEntries(Object.entries(ψMap.λ).map(([k, v]) => [v, k])),
    ℝ: Object.fromEntries(Object.entries(ψMap.ℝ).map(([k, v]) => [v, k])),
    ∇: Object.fromEntries(Object.entries(ψMap.∇).map(([k, v]) => [v, k])),
    ρ: Object.fromEntries(Object.entries(ψMap.ρ).map(([k, v]) => [v, k])),
    Ξ: Object.fromEntries(Object.entries(ψMap.Ξ).map(([k, v]) => [v, k])),
    𝔸: Object.fromEntries(Object.entries(ψMap.𝔸).map(([k, v]) => [v.toString(), k]))
};

// Vector-based numeric encoder - Revolutionary LLM efficiency
export function χNumber(num: number): string {
    // Special constants (highest priority)
    if (num === Infinity) return '⊗∞';
    if (isNaN(num)) return '⊗∅';
    if (Math.abs(num - Math.PI) < 0.0001) return '⊗π';
    if (Math.abs(num - Math.E) < 0.0001) return '⊗e';
    if (Math.abs(num - 1.618) < 0.001) return '⊗φ';
    
    // Common fractions (before integer check)
    if (num === 0.5) return '⊗½';
    if (num === 0.25) return '⊗¼';
    if (num === 0.75) return '⊗¾';
    if (Math.abs(num - 0.333) < 0.001) return '⊗⅓';
    if (Math.abs(num - 0.667) < 0.001) return '⊗⅔';
    
    // Direct lookup for predefined vectors
    for (const [vector, value] of Object.entries(ψMap.𝔸)) {
        if (value === num) return vector;
    }
    
    // Single digits (0-9)
    if (num >= 0 && num <= 9 && Number.isInteger(num)) {
        const digits = ['⊗∅','⊗α','⊗β','⊗γ','⊗δ','⊗ε','⊗ζ','⊗η','⊗θ','⊗ι'];
        return digits[num];
    }
    
    // Negative single digits
    if (num >= -9 && num <= -1 && Number.isInteger(num)) {
        const negDigits = ['⊗⁻α','⊗⁻β','⊗⁻γ','⊗⁻δ','⊗⁻ε','⊗⁻ζ','⊗⁻η','⊗⁻θ','⊗⁻ι'];
        return negDigits[-num - 1];
    }
    
    // Two-digit numbers (10-99) - Vector composition
    if (num >= 10 && num <= 99 && Number.isInteger(num)) {
        const tens = Math.floor(num / 10);
        const units = num % 10;
        const tensVec = ['','α','β','γ','δ','ε','ζ','η','θ','ι'][tens];
        const unitsVec = ['∅','α','β','γ','δ','ε','ζ','η','θ','ι'][units];
        
        if (tens === 1) return `⊗χ${unitsVec === '∅' ? '' : unitsVec}`;
        return `⊗${tensVec}${units === 0 ? 'χ' : 'χ' + unitsVec}`;
    }
    
    // Powers of 10 (100, 1000, etc.)
    if (Number.isInteger(num) && num > 0) {
        const log10 = Math.log10(num);
        if (Number.isInteger(log10)) {
            const powerVectors = ['⊗∅','⊗χ','⊗ψ','⊗ω','⊗Α','⊗Β'];
            if (log10 < powerVectors.length) return powerVectors[log10];
        }
    }
    
    // Complex numbers: decompose into vector operations
    // For now, use base-34 encoding with vector prefix
    const base = 10; // Simpler base for readability
    const chars = '∅αβγδεζηθι';
    let result = '';
    let n = Math.abs(Math.floor(num));
    
    if (n === 0) return '⊗∅';
    
    while (n > 0) {
        result = chars[n % base] + result;
        n = Math.floor(n / base);
    }
    
    return num < 0 ? '⊗⁻' + result : '⊗' + result;
}

// Vector-based numeric decoder - Processes ⊗ vector numbers
export function ωNumber(encoded: string): number {
    // Direct vector lookup (fastest path)
    if (encoded in ψMap.𝔸) {
        return ψMap.𝔸[encoded];
    }
    
    // All vector numbers start with ⊗
    if (!encoded.startsWith('⊗')) {
        throw new Error(`Invalid vector number: ${encoded}`);
    }
    
    const vectorPart = encoded.slice(1); // Remove ⊗ prefix
    
    // Handle negation
    if (vectorPart.startsWith('⁻')) {
        const positiveVector = '⊗' + vectorPart.slice(1);
        if (positiveVector in ψMap.𝔸) {
            return -ψMap.𝔸[positiveVector];
        }
        // Decode positive part and negate
        const positiveResult = ωNumber('⊗' + vectorPart.slice(1));
        return -positiveResult;
    }
    
    // Vector composition decoding
    // Handle patterns like ⊗χα (11), ⊗βχγ (23), etc.
    const digitMap: Record<string, number> = {
        '∅': 0, 'α': 1, 'β': 2, 'γ': 3, 'δ': 4, 'ε': 5, 
        'ζ': 6, 'η': 7, 'θ': 8, 'ι': 9, 'χ': 10
    };
    
    // Two-digit numbers with χ (tens)
    if (vectorPart.includes('χ')) {
        const parts = vectorPart.split('χ');
        if (parts.length === 2) {
            const tensStr = parts[0];
            const unitsStr = parts[1];
            
            let tens = 0;
            let units = 0;
            
            // Decode tens
            if (tensStr === '') {
                tens = 1; // Just χ means 10
            } else if (tensStr in digitMap) {
                tens = digitMap[tensStr];
            }
            
            // Decode units
            if (unitsStr === '') {
                units = 0;
            } else if (unitsStr in digitMap) {
                units = digitMap[unitsStr];
            }
            
            return tens * 10 + units;
        }
    }
    
    // Simple digit sequences (e.g., ⊗αβγ = 123)
    let result = 0;
    let base = 1;
    
    // Process from right to left
    for (let i = vectorPart.length - 1; i >= 0; i--) {
        const char = vectorPart[i];
        if (char in digitMap) {
            result += digitMap[char] * base;
            base *= 10;
        } else {
            throw new Error(`Unknown vector symbol: ${char} in ${encoded}`);
        }
    }
    
    return result;
}

// Mathematical text expansion
export function αText(text: string): string {
    let result = text;
    
    // Expand mathematical constructs
    for (const [chinese, math] of Object.entries(ψMap.λ)) {
        result = result.replace(new RegExp(chinese, 'g'), math);
    }
    
    // Expand data types
    for (const [chinese, math] of Object.entries(ψMap.ℝ)) {
        result = result.replace(new RegExp(chinese, 'g'), math);
    }
    
    // Expand control flow
    for (const [chinese, math] of Object.entries(ψMap.∇)) {
        result = result.replace(new RegExp(chinese, 'g'), math);
    }
    
    // Expand CSS properties
    for (const [english, greek] of Object.entries(ψMap.ρ)) {
        result = result.replace(new RegExp(`\\b${english}\\b`, 'g'), greek);
    }
    
    // Expand operations
    for (const [english, math] of Object.entries(ψMap.Ξ)) {
        result = result.replace(new RegExp(`\\b${english}\\b`, 'g'), math);
    }
    
    return result;
}

// Mathematical text compression
export function ψText(text: string): string {
    let result = text;
    
    // Compress operations first (longest matches)
    for (const [english, math] of Object.entries(φMap.Ξ)) {
        result = result.replace(new RegExp(`\\b${english}\\b`, 'g'), math);
    }
    
    // Compress CSS properties
    for (const [greek, english] of Object.entries(φMap.ρ)) {
        result = result.replace(new RegExp(`\\b${english}\\b`, 'g'), greek);
    }
    
    // Compress control flow
    for (const [math, chinese] of Object.entries(φMap.∇)) {
        result = result.replace(new RegExp(`\\b${chinese}\\b`, 'g'), math);
    }
    
    // Compress data types
    for (const [math, chinese] of Object.entries(φMap.ℝ)) {
        result = result.replace(new RegExp(chinese, 'g'), math);
    }
    
    // Compress core constructs
    for (const [math, chinese] of Object.entries(φMap.λ)) {
        result = result.replace(new RegExp(chinese, 'g'), math);
    }
    
    return result;
}

// LLM Token Efficiency Calculator
export function tokenEfficiency(originalText: string, compressedText: string): {
    originalLength: number;
    compressedLength: number;
    compressionRatio: number;
    estimatedTokenReduction: number;
} {
    const originalLength = originalText.length;
    const compressedLength = compressedText.length;
    const compressionRatio = compressedLength / originalLength;
    
    // Estimate token reduction (mathematical symbols are typically single tokens)
    const estimatedTokenReduction = 1 - (compressedLength * 0.8) / originalLength;
    
    return {
        originalLength,
        compressedLength,
        compressionRatio,
        estimatedTokenReduction: Math.max(0, estimatedTokenReduction)
    };
}