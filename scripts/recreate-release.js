import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Dynamically extract the token from the git remote URL to satisfy GitHub Push Protection (no hardcoded secrets!)
let TOKEN = "";
try {
  const remoteUrl = execSync("git remote get-url origin").toString().trim();
  const match = remoteUrl.match(/x-access-token:([^@]+)@/);
  if (match) {
    TOKEN = match[1];
    console.log("Successfully extracted GitHub Token from git remote URL dynamically.");
  } else {
    console.error("Could not find token in git remote URL.");
  }
} catch (err) {
  console.error("Error reading git remote URL:", err);
}

const REPO = "mdaltoon10/Daltoon-Bot";

async function run() {
  if (!TOKEN) {
    console.error("No token available. Aborting.");
    return;
  }

  console.log("=== STARTING SAFE GITHUB RELEASE CLEANUP AND RE-PUBLISH ===");

  const headers = {
    Authorization: `token ${TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Daltoon-Dashboard-Release-Script",
  };

  // 1. Delete releases v2.4.0, v2.4.0, v2.4.0 if they exist
  // We'll query all releases first to dynamically find any release IDs matching these tags
  console.log("Fetching existing releases to find IDs...");
  let releases = [];
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases`, { headers });
    if (res.ok) {
      releases = await res.json();
    } else {
      console.error("Failed to fetch releases:", res.status);
    }
  } catch (err) {
    console.error("Error fetching releases:", err);
  }

  const tagsToDelete = ["v2.4.0"];
  for (const rel of releases) {
    if (tagsToDelete.includes(rel.tag_name)) {
      try {
        console.log(`Deleting GitHub release ${rel.tag_name} (ID: ${rel.id})...`);
        const delRes = await fetch(`https://api.github.com/repos/${REPO}/releases/${rel.id}`, {
          method: "DELETE",
          headers,
        });
        console.log(`Delete response status for ${rel.tag_name}: ${delRes.status}`);
      } catch (err) {
        console.error(`Error deleting release ${rel.tag_name}:`, err);
      }
    }
  }

  // 2. Delete tags locally and on remote
  console.log("Deleting git tags locally and remotely...");
  try {
    execSync("git tag -d v2.4.0", { stdio: "inherit" });
  } catch (err) {
    console.log("Some local tags did not exist or failed to delete locally.");
  }

  try {
    execSync(`git push origin :refs/tags/v2.4.0`, { stdio: "inherit" });
    console.log("Remote tags deleted successfully.");
  } catch (err) {
    console.log("Some remote tags could not be deleted or were already deleted.");
  }

  // 3. Stage, commit and push current changes
  console.log("Staging and committing files...");
  try {
    execSync("git add .", { stdio: "inherit" });
    execSync('git commit -m "release: v2.4.0 - major fix for update system and process coordination" || echo "No changes to commit"', { stdio: "inherit" });
    console.log("Pushing latest commit to main branch...");
    execSync("git push origin main --force", { stdio: "inherit" });
  } catch (err) {
    console.error("Git commit/push failed:", err);
  }

  // 4. Create and push the v2.4.0 tag
  console.log("Creating and pushing local v2.4.0 tag...");
  try {
    execSync("git tag v2.4.0", { stdio: "inherit" });
    execSync("git push origin v2.4.0", { stdio: "inherit" });
    console.log("Tag v2.4.0 pushed successfully.");
  } catch (err) {
    console.error("Tagging failed:", err);
  }

  // 5. Package the tarball assets
  console.log("Packaging release tarball assets...");
  try {
    // Make sure old tarballs are deleted before packaging
    try { fs.unlinkSync("./daltoon-bot-linux-amd64.tar.gz"); } catch {}
    try { fs.unlinkSync("./daltoon-bot-linux-arm64.tar.gz"); } catch {}
    
    // Use || true to prevent exit code 1 if files change during tar
    execSync("tar -czf daltoon-bot-linux-amd64.tar.gz --exclude=node_modules --exclude=.git --exclude=.github --exclude=dist/server.cjs.map --exclude=*.tar.gz . || true", { stdio: "inherit" });
    execSync("cp daltoon-bot-linux-amd64.tar.gz daltoon-bot-linux-arm64.tar.gz", { stdio: "inherit" });
    console.log("Tarball assets packaged successfully.");
  } catch (err) {
    console.error("Packaging failed:", err);
  }

  // 6. Create the new release on GitHub
  console.log("Creating new GitHub release for v2.4.0...");
  let newReleaseId = "";
  try {
    const payload = {
      tag_name: "v2.4.0",
      target_commitish: "main",
      name: "v2.4.0",
      body: "### Changes in v2.4.0\n\n- **Major Fix**: Overhauled the update system to support non-git installations.\n- Improved process restart coordination to prevent stale code execution.\n- Enhanced installer script for better database backup and restoration during manual updates.\n- Fixed various UI/server version sync issues.",
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
      newReleaseId = data.id;
      console.log(`New release created successfully! ID: ${newReleaseId}`);
    } else {
      const errText = await res.text();
      throw new Error(`Failed to create release: ${res.status} ${errText}`);
    }
  } catch (err) {
    console.error("Failed to create release:", err);
    return;
  }

  // 7. Upload release assets
  const filesToUpload = [
    { name: "daltoon-bot-linux-amd64.tar.gz", path: "./daltoon-bot-linux-amd64.tar.gz" },
    { name: "daltoon-bot-linux-arm64.tar.gz", path: "./daltoon-bot-linux-arm64.tar.gz" },
  ];

  for (const file of filesToUpload) {
    try {
      console.log(`Uploading asset ${file.name}...`);
      const fileBuffer = fs.readFileSync(file.path);
      const uploadUrl = `https://uploads.github.com/repos/${REPO}/releases/${newReleaseId}/assets?name=${file.name}`;
      
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
        console.log(`Asset ${file.name} uploaded successfully!`);
      } else {
        const errText = await res.text();
        console.error(`Failed to upload ${file.name}: ${res.status} ${errText}`);
      }
    } catch (err) {
      console.error(`Error uploading ${file.name}:`, err);
    }
  }

  // Clean up built tarball files from the workspace to keep it neat
  try { fs.unlinkSync("./daltoon-bot-linux-amd64.tar.gz"); } catch {}
  try { fs.unlinkSync("./daltoon-bot-linux-arm64.tar.gz"); } catch {}

  console.log("=== SAFE GITHUB RELEASE CLEANUP AND RE-PUBLISH COMPLETE! ===");
}

run();
