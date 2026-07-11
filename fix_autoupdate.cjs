const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldBlock = `        if (channel === 'dev') {
          writeLog(\`Step 1: Pulling latest changes from dev branch...\`);
          const gitCmd = \`git fetch origin dev && git reset --hard origin/dev\`;
          const gitResult = await runCommandAsync(gitCmd);
          writeLog(\`Git output:\\n\${gitResult.stdout}\\n\${gitResult.stderr}\`);
          
          writeLog(\`Step 2: Building project...\`);
          const buildResult = await runCommandAsync(\`npm run build\`);
          writeLog(\`Build output:\\n\${buildResult.stdout}\\n\${buildResult.stderr}\`);
        } else {
          writeLog(\`Step 1: Pulling latest changes from stable branch (tag \${targetTag})...\`);
          const gitCmd = \`git fetch origin --tags && git checkout -f \${targetTag}\`;
          const gitResult = await runCommandAsync(gitCmd);
          writeLog(\`Git output:\\n\${gitResult.stdout}\\n\${gitResult.stderr}\`);
          
          writeLog(\`Step 2: Building project...\`);
          const buildResult = await runCommandAsync(\`npm run build\`);
          writeLog(\`Build output:\\n\${buildResult.stdout}\\n\${buildResult.stderr}\`);
        }

        // Step 3: Make files executable
        writeLog(\`Step 3: Making executable files executable...\`);
        await runCommandAsync("chmod +x daltoon-dashboard install.sh 2>/dev/null || true");

        // Step 4: Install Python Dependencies (Optional/No-block)
        writeLog(\`Step 4: Installing Python dependencies...\`);
        const pipCmd = "pip3 install -U pyTelegramBotAPI python-dotenv requests --break-system-packages || pip3 install -U pyTelegramBotAPI python-dotenv requests || true";
        const pipResult = await runCommandAsync(pipCmd);
        writeLog(\`Pip output:\\n\${pipResult.stdout}\\n\${pipResult.stderr}\`);

        // Step 5: Install npm dependencies (only production)
        writeLog(\`Step 5: Installing npm dependencies...\`);
        const npmInstallResult = await runCommandAsync("npm ci --omit=dev || npm install --omit=dev");
        writeLog(\`npm install output:\\n\${npmInstallResult.stdout}\\n\${npmInstallResult.stderr}\`);`;

const newBlock = `        if (channel === 'dev') {
          writeLog(\`Step 1: Pulling latest changes from dev branch...\`);
          const gitCmd = \`git fetch origin dev && git reset --hard origin/dev\`;
          const gitResult = await runCommandAsync(gitCmd);
          writeLog(\`Git output:\\n\${gitResult.stdout}\\n\${gitResult.stderr}\`);
          
          writeLog(\`Step 2: Installing dependencies...\`);
          const npmInstallResult = await runCommandAsync("npm install");
          writeLog(\`npm install output:\\n\${npmInstallResult.stdout}\\n\${npmInstallResult.stderr}\`);

          writeLog(\`Step 3: Building project...\`);
          const buildResult = await runCommandAsync(\`npm run build\`);
          writeLog(\`Build output:\\n\${buildResult.stdout}\\n\${buildResult.stderr}\`);
        } else {
          writeLog(\`Step 1: Pulling latest changes from stable branch (tag \${targetTag})...\`);
          const gitCmd = \`git fetch origin --tags && git checkout -f \${targetTag}\`;
          const gitResult = await runCommandAsync(gitCmd);
          writeLog(\`Git output:\\n\${gitResult.stdout}\\n\${gitResult.stderr}\`);
          
          writeLog(\`Step 2: Installing dependencies...\`);
          const npmInstallResult = await runCommandAsync("npm install");
          writeLog(\`npm install output:\\n\${npmInstallResult.stdout}\\n\${npmInstallResult.stderr}\`);

          writeLog(\`Step 3: Building project...\`);
          const buildResult = await runCommandAsync(\`npm run build\`);
          writeLog(\`Build output:\\n\${buildResult.stdout}\\n\${buildResult.stderr}\`);
        }

        // Step 4: Make files executable
        writeLog(\`Step 4: Making executable files executable...\`);
        await runCommandAsync("chmod +x daltoon-dashboard install.sh 2>/dev/null || true");

        // Step 5: Install Python Dependencies (Optional/No-block)
        writeLog(\`Step 5: Installing Python dependencies...\`);
        const pipCmd = "pip3 install -U pyTelegramBotAPI python-dotenv requests --break-system-packages || pip3 install -U pyTelegramBotAPI python-dotenv requests || true";
        const pipResult = await runCommandAsync(pipCmd);
        writeLog(\`Pip output:\\n\${pipResult.stdout}\\n\${pipResult.stderr}\`);`;

if (code.includes(oldBlock)) {
  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync('server.ts', code);
  console.log("Auto-update sequence patched!");
} else {
  console.log("Could not find the exact old block to replace. Please check.");
}
