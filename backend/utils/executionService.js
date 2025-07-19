const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Note: Using node-fetch v2 for CommonJS compatibility
// If you have ` "type": "module" ` in your package.json, you can use `import fetch from 'node-fetch'`.
// Otherwise, install v2: `npm install node-fetch@2`
const fetch = require('node-fetch'); 

const TEMP_DIR = path.join(__dirname, '..', 'temp'); // Corrected path to be inside /backend/temp
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Helper to check if a command-line tool is available
function isCommandAvailable(command) {
  try {
    // execSync will throw an error if the command is not found
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const LANGUAGE_CONFIG = {
  python: {
    local: {
      command: (filepath) => `python3 "${filepath}"`, // Prefer python3 for consistency
      extension: 'py',
      check: () => isCommandAvailable('python3')
    },
    web: {
      api: 'https://emkc.org/api/v2/piston/execute',
      runtime: 'python',
      version: '3.10.0'
    }
  },
  javascript: {
    local: {
      command: (filepath) => `node "${filepath}"`,
      extension: 'js',
      check: () => isCommandAvailable('node')
    },
    web: {
      api: 'https://emkc.org/api/v2/piston/execute',
      runtime: 'javascript', // Piston API uses 'javascript', not 'node'
      version: '18.15.0'
    }
  },
  typescript: { // <-- ADDED MISSING TYPESCRIPT CONFIG
    local: {
      command: (filepath) => `ts-node "${filepath}"`,
      extension: 'ts',
      check: () => isCommandAvailable('ts-node')
    },
    web: {
      api: 'https://emkc.org/api/v2/piston/execute',
      runtime: 'typescript',
      version: '5.0.3'
    }
  },
  java: {
    local: {
      // This command compiles and then runs. It assumes the class is named Main.
      command: (filepath) => `javac "${filepath}" && java -cp "${path.dirname(filepath)}" Main`,
      extension: 'java',
      check: () => isCommandAvailable('javac')
    },
    web: {
      api: 'https://emkc.org/api/v2/piston/execute',
      runtime: 'java',
      version: '15.0.2'
    }
  }
};

// Use the more robust `exec` which is asynchronous and won't block the server
async function executeLocal(code, language) {
  const config = LANGUAGE_CONFIG[language]?.local;
  // This check is now redundant because of the logic in executeCode, but good for safety
  if (!config) return { error: 'Unsupported language for local execution.' };

  // For Java, ensure the code contains `public class Main`
  if (language === 'java' && !code.includes('public class Main')) {
    return { error: 'Java code must contain a "public class Main" definition for local execution.' };
  }

  const filename = language === 'java' 
    ? path.join(TEMP_DIR, 'Main.java') // Java file must be named Main.java
    : path.join(TEMP_DIR, `${uuidv4()}.${config.extension}`);

  return new Promise((resolve) => {
    fs.writeFileSync(filename, code);
    
    exec(config.command(filename), { timeout: 10000 }, (error, stdout, stderr) => {
      fs.unlinkSync(filename); // Always clean up the file
      if (language === 'java' && fs.existsSync(path.join(TEMP_DIR, 'Main.class'))) {
        fs.unlinkSync(path.join(TEMP_DIR, 'Main.class')); // Clean up .class file too
      }

      if (error) {
        // stderr often contains the useful error message
        resolve({ error: stderr || error.message });
      } else if (stderr) {
        // Some tools write warnings to stderr even on success
        resolve({ output: stdout, error: stderr });
      } else {
        resolve({ output: stdout });
      }
    });
  });
}

async function executeWeb(code, language) {
  const config = LANGUAGE_CONFIG[language]?.web;
  if (!config) return { error: `Unsupported language for web execution: ${language}` };

  const fileName = language === 'java' ? 'Main.java' : `main.${LANGUAGE_CONFIG[language].local.extension}`;

  try {
    const response = await fetch(config.api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: config.runtime,
        version: config.version,
        files: [{ name: fileName, content: code }]
      }),
      timeout: 15000
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Piston API Error:", errorText);
      return { error: `API Error (${response.status}): Failed to execute code.` };
    }

    const data = await response.json();
    const run = data.run || {};
    return {
      output: run.stdout || (run.stderr ? null : "Execution finished with no output."),
      error: run.stderr || null
    };
  } catch (error) {
    console.error("Web execution fetch error:", error);
    return { error: `Web execution failed: ${error.message}` };
  }
}

// The single, correct execution controller function
async function executeCode(code, language) {
  const localConfig = LANGUAGE_CONFIG[language]?.local;

  // Strategy: Try local execution if the required tool is available, otherwise fall back to the web API.
  if (localConfig && localConfig.check()) {
    console.log(`Executing ${language} locally...`);
    return await executeLocal(code, language);
  } else {
    console.log(`Local tool for ${language} not found or not configured. Falling back to web execution...`);
    return await executeWeb(code, language);
  }
}

// You haven't shown executionController.js, but it should look like this:
const executionController = {
    execute: async (req, res) => {
        const { language, code } = req.body;
        if (!language || !code) {
            return res.status(400).json({ error: 'Language and code are required.' });
        }
        try {
            const result = await executeCode(code, language);
            res.json(result);
        } catch (error) {
            console.error('Execution Controller Error:', error);
            res.status(500).json({ error: 'An unexpected server error occurred.' });
        }
    }
};


module.exports = { 
  executeCode,
  execute: executionController.execute // Export the controller function directly
};
