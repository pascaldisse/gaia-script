const fs = require("fs");
const path = require("path");

/**
 * Load all encoding extensions from the ext directory
 * @returns {Object} Combined encoding table
 */
function loadExtensions() {
  const extDir = __dirname;
  const encodings = {};
  
  try {
    // Get all JSON and MD files
    const extFiles = fs.readdirSync(extDir).filter(file => 
      file.endsWith(".json") || file.endsWith(".md")
    );
    
    console.log(`[Extension Loader] Found ${extFiles.length} extension files`);
    
    for (const file of extFiles) {
      const extPath = path.join(extDir, file);
      
      try {
        if (file.endsWith(".json")) {
          // JSON format
          const extData = JSON.parse(fs.readFileSync(extPath, "utf-8"));
          Object.assign(encodings, extData);
          console.log(`[Extension Loader] Loaded ${Object.keys(extData).length} encodings from ${file}`);
        } else if (file.endsWith(".md")) {
          // Markdown format
          const extContent = fs.readFileSync(extPath, "utf-8");
          const codeWordRegex = /```[\s\S]*?Code\s+Word[\s\S]*?```/g;
          const codeWordBlocks = extContent.match(codeWordRegex) || [];
          
          let mdEncodingCount = 0;
          
          for (const block of codeWordBlocks) {
            const lines = block.split("\n").filter(line => 
              line.trim() && \!line.includes("```") && \!line.includes("Code") && \!line.includes("---")
            );
            
            for (const line of lines) {
              const parts = line.trim().split(/\s+/);
              if (parts.length >= 2) {
                const code = parts[0].trim();
                const word = parts.slice(1).join(" ").trim();
                
                if (code && word) {
                  encodings[word] = code;
                  mdEncodingCount++;
                }
              }
            }
          }
          
          console.log(`[Extension Loader] Loaded ${mdEncodingCount} encodings from ${file}`);
        }
      } catch (err) {
        console.error(`[Extension Loader] Error loading ${file}: ${err.message}`);
      }
    }
    
    console.log(`[Extension Loader] Total encodings loaded: ${Object.keys(encodings).length}`);
    return encodings;
  } catch (error) {
    console.error(`[Extension Loader] Failed to load extensions: ${error.message}`);
    return {};
  }
}

module.exports = { loadExtensions };
