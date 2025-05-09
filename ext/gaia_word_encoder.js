// GaiaScript encoding utility
// Generated on 2025-04-25T01:42:01.685Z

function encodeGaiaWord(word) {
  const wordLower = word.toLowerCase();
  const encodingTable = {
    "the": "w₀",
    "of": "w₁",
    "and": "w₂",
    "to": "w₃",
    "a": "w₄",
    "in": "w₅",
    "is": "w₆",
    "you": "w₇",
    "are": "w₈",
    "for": "w₉",
    "it": "w₁₀",
    "with": "w₁₁",
    "on": "w₁₂",
    "this": "w₁₃",
    "but": "w₁₄",
    "her": "w₁₅",
    "or": "w₁₆",
    "his": "w₁₇",
    "she": "w₁₈",
    "will": "w₁₉",
    "execution": "w₈₁",
    "commands": "w₈₂",
    "gaiascript": "w₈₃",
    "language": "w₈₄",
    "requirements": "w₈₅",
    "always": "w₈₆",
    "use": "w₈₇",
    "code": "w₈₈",
    "style": "w₈₉",
    "guidelines": "w₉₀",
    "imports": "w₉₁",
    "formatting": "w₉₂",
    "naming": "w₉₃",
    "state": "w₉₄",
    "declaration": "w₉₅",
    "functions": "w₉₆",
    "ui": "w₉₇",
    "components": "w₉₈",
    "styles": "w₉₉",
    "variable": "w₁₀₀",
    "interpolation": "w₁₀₁",
    "error": "w₁₀₂",
    "handling": "w₁₀₃",
    "standard": "w₁₀₄",
    "project": "w₁₀₅",
    "structure": "w₁₀₆",
    "ecosystem": "w₁₀₇",
    "technical": "w₁₀₈",
    "specification": "w₁₀₉",
    "system": "w₁₁₀",
    "description": "w₁₁₁",
    "features": "w₁₁₂",
    "tech": "w₁₁₃",
    "syntax": "w₁₁₄",
    "numbers": "w₁₁₅",
    "operations": "w₁₁₆",
    "layers": "w₁₁₇",
    "0": "w₁120",
    "1": "w₁163",
    "10": "w₁164",
    "15": "w₁165",
    "64": "w₁138",
    "123": "w₁139",
    "1000": "w₁166",
    "1000000": "w₁140",
    "1000000000": "w₁141",
    ""0": "w₁118",
    "base64": "w₁119",
    ""flex",": "w₁121",
    ""bold",": "w₁122",
    "#⟨b⟩}": "w₁123",
    ""center",": "w₁124",
    "⟨/f⟩": "w₁125",
    ""14px",": "w₁126",
    "return": "w₁127",
    "const": "w₁128",
    ""24px",": "w₁129",
    ""12px",": "w₁130",
    "ai": "w₁131",
    "i⟨": "w₁132",
    "#⟨b⟩,": "w₁133",
    "20px",": "w₁134",
    ""white",": "w₁135",
    ""10px": "w₁136",
    ""20px",": "w₁137",
    "projects:": "w₁142",
    "l⟨": "w₁143",
    "null,": "w₁144",
    "#⟨3+8w⟩,": "w₁145",
    "(n": "w₁146",
    "#⟨a⟩)": "w₁147",
    "n": "w₁148",
    "try": "w₁149",
    "catch": "w₁150",
    "#⟨4c9184⟩": "w₁151",
    ""column",": "w₁152",
    ""#4a90e2",": "w₁153",
    ""center"}": "w₁154",
    "10px": "w₁155",
    "20px": "w₁156",
    ""20px"}": "w₁157",
    "ms⟧": "w₁158",
    ""1200px",": "w₁159",
    "8px": "w₁160",
    "0.3s": "w₁161",
    ""16px",": "w₁162",
    "n⟨ui,": "w₁167",
    "utils,": "w₁168",
    "jssystem⟩": "w₁169",
    "s⟨": "w₁170",
    "o⟨name:t⟨蓋-browser⟩,": "w₁171",
    "icon:t⟨🌐⟩,": "w₁172",
    "description:t⟨web": "w₁173",
    "o⟨name:t⟨蓋-chat⟩,": "w₁174",
    "icon:t⟨💬⟩,": "w₁175",
    "description:t⟨ai": "w₁176",
    "chat": "w₁177",
    "rpg": "w₁178",
    "o⟨name:t⟨蓋-cli⟩,": "w₁179",
    "icon:t⟨📟⟩,": "w₁180",
    "description:t⟨命令行": "w₁181",
    "o⟨name:t⟨蓋-code⟩,": "w₁182",
    "icon:t⟨📝⟩,": "w₁183",
    "description:t⟨w₈₈": "w₁184",
    "o⟨name:t⟨蓋-llm⟩,": "w₁185",
    "icon:t⟨🧠⟩,": "w₁186",
    "description:t⟨大型": "w₁187",
    "o⟨name:t⟨蓋-matrix⟩,": "w₁188",
    "icon:t⟨🔢⟩,": "w₁189",
    "description:t⟨矩陣": "w₁190",
    "o⟨name:t⟨蓋-os⟩,": "w₁191",
    "icon:t⟨💻⟩,": "w₁192",
    "description:t⟨操作": "w₁193",
    "o⟨name:t⟨蓋-pdf⟩,": "w₁194",
    "icon:t⟨📄⟩,": "w₁195",
    "description:t⟨pdf": "w₁196",
    "o⟨name:t⟨蓋-space⟩,": "w₁197",
    "icon:t⟨🚀⟩,": "w₁198",
    "description:t⟨協作": "w₁199",
    "o⟨name:t⟨蓋-space-科☕⟩,": "w₁200",
    "icon:t⟨🌠⟩,": "w₁201",
    "description:t⟨科☕": "w₁202",
    "space⟩⟩,": "w₁203",
    "o⟨name:t⟨蓋-terminal⟩,": "w₁204",
    "icon:t⟨⌨️⟩,": "w₁205",
    "description:t⟨終端": "w₁206",
    "o⟨name:t⟨蓋-terminal-rn⟩,": "w₁207",
    "icon:t⟨📱⟩,": "w₁208",
    "description:t⟨react": "w₁209",
    "native": "w₁210",
    "o⟨name:t⟨蓋-webxr⟩,": "w₁211",
    "icon:t⟨🥽⟩,": "w₁212",
    "description:t⟨webxr": "w₁213",
    "3d": "w₁214",
    "vr": "w₁215",
    "o⟨name:t⟨蓋🌍⟩,": "w₁216",
    "icon:t⟨📚⟩,": "w₁217",
    "description:t⟨蓋🌍": "w₁218",
    "o⟨name:t⟨看板⟩,": "w₁219",
    "icon:t⟨📋⟩,": "w₁220",
    "description:t⟨w₁₀₅": "w₁221",
    "selected:": "w₁222",
    "error:": "w₁223",
    "counts:": "w₁224",
    "#⟨p⟩,": "w₁225",
    "activeusers:": "w₁226",
    "totalbuilds:": "w₁227",
    "#⟨4c9184⟩,": "w₁228",
    "avgloadtime:": "w₁229",
    "#⟨b7⟩": "w₁230",
    "f⟨處理錯誤,": "w₁231",
    "console.error(錯誤);": "w₁232",
    "s.error": "w₁233",
    "錯誤.message;": "w₁234",
    "f⟨tobase64,": "w₁235",
    "n⟩": "w₁236",
    "if": "w₁237",
    ""a";": "w₁238",
    "digits": "w₁239",
    ""abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz0123456789+/";": "w₁240",
    "while": "w₁241",
    "remainder": "w₁242",
    "#⟨ba⟩;": "w₁243",
    "digits.push(base64[remainder]);": "w₁244",
    "math.floor(n": "w₁245",
    "#⟨ba⟩);": "w₁246",
    "digits.reverse().join('');": "w₁247",
    "f⟨打開項目,": "w₁248",
    "窗口.位置.href": "w₁249",
    "f⟨加載項目⟩": "w₁250",
    "s.projects;": "w₁251",
    "t⇀e⌓⊿⋮+p→[h⌗a→n→f⋮⊹⋱⌗→d⊹ᴧ¹]×⊧→d₁⊿⊹⋮⋱r→d₀v→s": "w₁252",
    "#⟨a⟩,": "w₁253",
    "#⟨k⟩,": "w₁254",
    "#⟨ba⟩,": "w₁255",
    "#⟨b7⟩,": "w₁256",
    "#⟨pd⟩,": "w₁257",
    "ui⟨✱⟩": "w₁258",
    ""100vh",": "w₁259",
    ""sans-serif",": "w₁260",
    ""#1e1e1e",": "w₁261",
    ""#ffffff"}": "w₁262",
    ""40px": "w₁263",
    ""36px",": "w₁264",
    "0"}⟦蓋-hub⟧": "w₁265",
    ""18px",": "w₁266",
    ""800px",": "w₁267",
    "auto"}⟦瀏覽": "w₁268",
    ""rgba(255,255,255,0.8)",": "w₁269",
    "0"}⟦#⟨p⟩": "w₁270",
    "#⟨3+8w⟩": "w₁271",
    "i⟨s.error": "w₁272",
    ""#ff4444",": "w₁273",
    "0"}": "w₁274",
    "${s.error}⟧": "w₁275",
    ""#2d2d2d",": "w₁276",
    ""#ccc",": "w₁277",
    "0",": "w₁278",
    ""normal"}⟦項目總數⟧": "w₁279",
    ""#4a90e2"}⟦#⟨p⟩⟧": "w₁280",
    ""normal"}⟦平均加載時間⟧": "w₁281",
    ""#4a90e2"}⟦#⟨b7⟩": "w₁282",
    ""normal"}⟦活躍用戶⟧": "w₁283",
    ""#4a90e2"}⟦#⟨3+8w⟩⟧": "w₁284",
    ""30px",": "w₁285",
    "auto",": "w₁286",
    ""wrap",": "w₁287",
    "f⟨映射,": "w₁288",
    "item,": "w₁289",
    "c⟨項目卡片⟩": "w₁290",
    ""300px",": "w₁291",
    ""200px",": "w₁292",
    ""15px",": "w₁293",
    ""8px",": "w₁294",
    "4px": "w₁295",
    "rgba(0,0,0,0.1)",": "w₁296",
    ""#252525",": "w₁297",
    ""pointer",": "w₁298",
    ""transform": "w₁299",
    "ease,": "w₁300",
    "box-shadow": "w₁301",
    "ease",": "w₁302",
    ""translatey(-5px)",": "w₁303",
    "16px": "w₁304",
    "rgba(0,0,0,0.2)"},": "w₁305",
    "打開項目(item.name)}": "w₁306",
    ""15px"}": "w₁307",
    ""42px",": "w₁308",
    ""15px"}⟦${item.icon}⟧": "w₁309",
    ""#eee"}⟦${item.name}⟧": "w₁310",
    ""#bbb",": "w₁311",
    ""1.5"}": "w₁312",
    "⟦${item.description}⟧": "w₁313",
    ""flex-end",": "w₁314",
    ""auto"}": "w₁315",
    ""8px": "w₁316",
    "16px",": "w₁317",
    ""4px",": "w₁318",
    "e": "w₁319",
    "{e.stoppropagation();": "w₁320",
    "打開項目(item.name);}}": "w₁321",
    "w₁₀₅⟧": "w₁322",
    "⟨/c⟩": "w₁323",
    ""#333",": "w₁324",
    ""#999"}": "w₁325",
    "auto"}": "w₁326",
    "0"}⟦系統狀態⟧": "w₁327",
    ""bold"}⟦cpu": "w₁328",
    ""18px"}⟦#⟨b7⟩%⟧": "w₁329",
    ""bold"}⟦記憶體使用率⟧": "w₁330",
    ""18px"}⟦#⟨od⟩": "w₁331",
    "mb": "w₁332",
    "#⟨k0⟩": "w₁333",
    "gb⟧": "w₁334",
    ""bold"}⟦構建數量⟧": "w₁335",
    ""18px"}⟦#⟨4c9184⟩⟧": "w₁336",
    ""bold"}⟦加載時間⟧": "w₁337",
    ""18px"}⟦#⟨b7⟩": "w₁338",
    ""#666",": "w₁339",
    ""1px": "w₁340",
    "solid": "w₁341",
    "#333"}": "w₁342",
    "t⇀e⌓⊿⋮+p→s": "w₁343",
    "#⟨b+⟩.#⟨c⟩.#⟨f⟩⟧": "w₁344",
    "⟨/ui⟩": "w₁345",
  };

  return encodingTable[wordLower] || word;
}

module.exports = { encodeGaiaWord };
