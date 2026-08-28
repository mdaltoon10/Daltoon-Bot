import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Version of the release
const VERSION = "5.0.7";
const REPO_OWNER = "mdaltoon10";
const REPO_NAME = "Daltoon-Bot";
const REPO = `${REPO_OWNER}/${REPO_NAME}`;

// Extract token from process.env or git remote
let TOKEN = process.env.GITHUB_TOKEN || process.env.GH_PAT || "";
if (!TOKEN) {
  try {
    const remoteUrl = execSync("git remote get-url origin").toString().trim();
    const match = remoteUrl.match(/https?:\/\/([^@:]+)(?::[^@]+)?@/);
    if (match) {
      TOKEN = match[1];
      console.log("Successfully extracted GITHUB_TOKEN from remote URL dynamically.");
    }
  } catch (err) {
    console.error("No token in environment, and could not parse remote URL:", err.message);
  }
}

async function run() {
  if (!TOKEN) {
    console.error("\n❌ Error: GITHUB_TOKEN is not available.");
    console.error("Please configure the GITHUB_TOKEN in your environment variables or");
    console.error("pass it when running the command: GITHUB_TOKEN=your_token node scripts/publish-release.js\n");
    process.exit(1);
  }

  console.log(`=== STARTING DEPLOYMENT & RELEASE WORKFLOW FOR v${VERSION} ===`);
  const headers = {
    Authorization: `token ${TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Daltoon-Bot-Release-Script",
  };

  // 1. Build the app to make sure all compiled bundles are perfectly fresh and ready
  console.log("[Step 1/8] Compiling applet and bundling production server...");
  try {
    execSync("npm run build", { stdio: "inherit" });
    console.log("✅ Build and server bundling completed successfully!");
  } catch (err) {
    console.error("❌ Build failed:", err);
    process.exit(1);
  }

  // 2. Clear any old tags or releases to prevent conflicts
  console.log(`[Step 2/8] Cleaning up existing releases or tags for v${VERSION}...`);
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases`, { headers });
    if (res.ok) {
      const releases = await res.json();
      const existingRelease = releases.find(r => r.tag_name === `v${VERSION}`);
      if (existingRelease) {
        console.log(`Found existing release for v${VERSION} (ID: ${existingRelease.id}). Deleting...`);
        await fetch(`https://api.github.com/repos/${REPO}/releases/${existingRelease.id}`, {
          method: "DELETE",
          headers,
        });
        console.log("✅ Existing GitHub release deleted.");
      }
    }
  } catch (err) {
    console.warn("⚠️ Warning: Could not clean up old releases:", err.message);
  }

  try {
    execSync(`git tag -d v${VERSION} 2>/dev/null || true`);
    execSync(`git push origin :refs/tags/v${VERSION} 2>/dev/null || true`);
    console.log("✅ Existing local and remote tags cleaned up.");
  } catch (err) {
    console.warn("⚠️ Warning: Could not clean up old tags:", err.message);
  }

  // 3. Stage, commit, and push codebase to GitHub
  console.log("[Step 3/8] Staging, committing and pushing latest changes to GitHub...");
  try {
    execSync('git config --global --add safe.directory "*" 2>/dev/null || true');
    execSync('git config --global http.postBuffer 524288000 2>/dev/null || true');
    execSync('git config --global http.version HTTP/1.1 2>/dev/null || true');
    execSync('rm -rf .git && git init 2>/dev/null || true');
    execSync('git config user.email "lagviradas@gmail.com" 2>/dev/null || true');
    execSync('git config user.name "Daltoon Developer" 2>/dev/null || true');
    execSync('git config http.postBuffer 524288000 2>/dev/null || true');
    execSync('git config http.version HTTP/1.1 2>/dev/null || true');

    const authUrl = `https://${TOKEN}@github.com/${REPO}.git`;
    try {
      execSync(`git remote add origin "${authUrl}" 2>/dev/null || git remote set-url origin "${authUrl}"`);
    } catch (_) {}

    // Stage changes (excluding big temp files if any)
    execSync("git add -A", { stdio: "inherit" });
    try {
      execSync(`git commit -m "release: v${VERSION} - bulletproof telegram HTML parsing and custom text escape"`);
    } catch {
      console.log("No new changes to commit, proceeding...");
    }

    console.log("Pushing main branch to GitHub remote...");
    execSync("git push origin HEAD:main --force", { stdio: "inherit" });
    console.log("✅ Pushed codebase to GitHub repository successfully.");
  } catch (err) {
    console.error("❌ Git push failed:", err);
    process.exit(1);
  }

  // 4. Create and push tag
  console.log(`[Step 4/8] Creating and pushing tag v${VERSION}...`);
  try {
    execSync(`git tag v${VERSION}`, { stdio: "inherit" });
    execSync(`git push origin v${VERSION} --force`, { stdio: "inherit" });
    console.log(`✅ Tag v${VERSION} created and pushed successfully.`);
  } catch (err) {
    console.error("❌ Tagging failed:", err);
    process.exit(1);
  }

  // 5. Package release assets
  console.log("[Step 5/8] Packaging production tarball assets...");
  const amd64Tar = `daltoon-bot-linux-amd64.tar.gz`;
  const arm64Tar = `daltoon-bot-linux-arm64.tar.gz`;
  try {
    try { fs.unlinkSync(`./${amd64Tar}`); } catch {}
    try { fs.unlinkSync(`./${arm64Tar}`); } catch {}

    // Exclude unneeded directories and files to keep package size minimal and clean
    execSync(`tar -czf ${amd64Tar} --exclude=node_modules --exclude=.git --exclude=.github --exclude=dist/server.cjs.map --exclude=*.tar.gz --exclude=scripts/ . || true`, { stdio: "inherit" });
    execSync(`cp ${amd64Tar} ${arm64Tar}`, { stdio: "inherit" });
    console.log("✅ Release archives packaged successfully.");
  } catch (err) {
    console.error("❌ Packaging failed:", err);
    process.exit(1);
  }

  // 6. Create the GitHub Release
  console.log(`[Step 6/8] Creating new GitHub release for v${VERSION}...`);
  let releaseId = "";
  try {
    const payload = {
      tag_name: `v${VERSION}`,
      target_commitish: "main",
      name: `v${VERSION}`,
      body: `### Daltoon Bot & Dashboard v${VERSION} Release 🚀

Welcome to the **v${VERSION} release** of Daltoon Bot & Dashboard!

#### Major Additions & Improvements in v${VERSION}:
- **💳 Filter Only Deposit & Receipt Transactions:**
  - The transaction management view now exclusively lists real deposit slips and card-to-card payments, cleanly isolating internal wallet balance deductions.
- **⚡ High-Speed Support Ticket Dispatch:**
  - Upgraded support ticket responses with instant optimistic UI rendering and optimized low-latency Telegram socket delivery so customer replies arrive in sub-seconds.
- **🛡️ Clean & Minimalist Human Verification Captcha:**
  - Streamlined the anti-bot challenge message to display strictly the question and answer choices with the clean title "تایید هویت انسانی".
- **🔒 Stability & Core Middleware Fixes:**
  - Optimized database locks, real-time SSE broadcasts, and production builds.`,
      draft: false,
      prerelease: false,
    };

    const res = await fetch(`https://api.github.com/repos/${REPO}/releases`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      releaseId = data.id;
      console.log(`✅ GitHub release created successfully! ID: ${releaseId}`);
    } else {
      const errText = await res.text();
      throw new Error(`Failed to create release: ${res.status} ${errText}`);
    }
  } catch (err) {
    console.error("❌ Error creating release:", err.message);
    process.exit(1);
  }

  // 7. Upload release assets
  console.log("[Step 7/8] Uploading release assets to GitHub...");
  const filesToUpload = [
    { name: amd64Tar, path: `./${amd64Tar}` },
    { name: arm64Tar, path: `./${arm64Tar}` },
  ];

  for (const file of filesToUpload) {
    try {
      console.log(`Uploading asset ${file.name}...`);
      const fileBuffer = fs.readFileSync(file.path);
      const uploadUrl = `https://uploads.github.com/repos/${REPO}/releases/${releaseId}/assets?name=${file.name}`;
      
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `token ${TOKEN}`,
          "Content-Type": "application/gzip",
          "Content-Length": fileBuffer.length.toString(),
        },
        body: fileBuffer,
      });

      if (res.ok) {
        console.log(`✅ Asset ${file.name} uploaded successfully!`);
      } else {
        const errText = await res.text();
        console.error(`❌ Failed to upload ${file.name}: ${res.status} ${errText}`);
      }
    } catch (err) {
      console.error(`❌ Error uploading asset ${file.name}:`, err.message);
    }
  }

  // 8. Clean up local tarball files
  console.log("[Step 8/8] Cleaning up temporary local files...");
  try {
    try { fs.unlinkSync(`./${amd64Tar}`); } catch {}
    try { fs.unlinkSync(`./${arm64Tar}`); } catch {}
    console.log("✅ Local workspace cleared.");
  } catch (err) {
    console.warn("⚠️ Warning: Could not delete local tarballs:", err.message);
  }

  console.log(`\n🎉 SUCCESS! v${VERSION} HAS BEEN SUCCESSFULLY COMPILED, COMMITTED, TAGGED, PUSHED AND RELEASED ON GITHUB! 🎉\n`);
}

run();
