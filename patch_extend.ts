import fs from "fs";
const file = "server.ts";
let content = fs.readFileSync(file, "utf8");

const extendCode = `
async function extendVpnClientApi(
  clientEmail: string,
  addGb: number,
  addDays: number,
  clientUuid?: string,
  serverId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    const activeServers = getActiveServers(settings);

    let server = null;
    if (serverId) {
      server = activeServers.find((s: any) => s.id === serverId);
    }
    if (!server && activeServers.length > 0) {
      server = activeServers.find((s: any) => s.status === "active") || activeServers[0];
    }

    if (!server) return { success: false, error: "No active server" };

    const cleanedUrl = normalizeXuiUrl(server.panelUrl);
    const loginResult = await loginXuiPanel(cleanedUrl, server.panelUsername, server.panelPassword);
    if (!loginResult.success || !loginResult.cookie) {
      return { success: false, error: "XUI Login Failed" };
    }

    const headers: Record<string, string> = {
      Cookie: loginResult.cookie,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (loginResult.csrfToken) headers["X-Csrf-Token"] = loginResult.csrfToken;

    let safeEmail = clientEmail ? clientEmail.replace(/ /g, "_").replace(/\n/g, "").replace(/\//g, "").replace(/[^A-Za-z0-9_-]/g, "") : "";

    // Get client to read current limits
    let clientData: any = null;
    let inboundId = null;

    const listRes = await xuiFetch(\`\${cleanedUrl}/panel/api/inbounds/list\`, { method: "GET", headers }, 10000);
    if (listRes.ok) {
      const resJson = await listRes.json().catch(() => ({}));
      if (resJson && resJson.success && Array.isArray(resJson.obj)) {
        for (const inbound of resJson.obj) {
          let clients = [];
          try {
             clients = JSON.parse(inbound.settings || "{}").clients || [];
          } catch(e) {}
          
          for (const c of clients) {
             if ((clientUuid && String(c.id) === String(clientUuid)) || (safeEmail && c.email === safeEmail)) {
                 clientData = c;
                 inboundId = inbound.id;
                 break;
             }
          }
          if (clientData) break;
        }
      }
    }

    if (!clientData) {
       return { success: false, error: "Client not found in panel" };
    }

    const currentTotal = Number(clientData.total) || 0;
    const currentExpiry = Number(clientData.expiryTime) || 0;

    const addBytes = Math.floor(addGb * 1024 * 1024 * 1024);
    const addMs = Math.floor(addDays * 24 * 60 * 60 * 1000);

    const newTotal = currentTotal + addBytes;
    const nowMs = Date.now();
    let newExpiry = currentExpiry === 0 || currentExpiry < nowMs ? nowMs + addMs : currentExpiry + addMs;

    const mergedC = { ...clientData };
    mergedC.total = newTotal;
    mergedC.expiryTime = newExpiry;
    mergedC.enable = true;

    const uid = mergedC.id;

    // Try update by UUID
    try {
      const updRes = await xuiFetch(\`\${cleanedUrl}/panel/api/clients/update/\${uid}\`, { method: "POST", headers, body: JSON.stringify(mergedC) }, 10000);
      if (updRes.ok) {
        const updJson = await updRes.json().catch(() => ({}));
        if (updJson && updJson.success) return { success: true };
      }
    } catch(e) {}

    // Fallback: update by email
    try {
      const updRes2 = await xuiFetch(\`\${cleanedUrl}/panel/api/clients/update/\${safeEmail}\`, { method: "POST", headers, body: JSON.stringify(mergedC) }, 10000);
      if (updRes2.ok) {
        const updJson2 = await updRes2.json().catch(() => ({}));
        if (updJson2 && updJson2.success) return { success: true };
      }
    } catch(e) {}

    // Fallback: update via inbound endpoint
    if (inboundId) {
      try {
        const updRes3 = await xuiFetch(\`\${cleanedUrl}/panel/api/inbounds/\${inboundId}/updateClient/\${uid}\`, {
           method: "POST",
           headers,
           body: JSON.stringify({
             id: inboundId,
             settings: JSON.stringify({ clients: [mergedC] })
           })
        }, 10000);
        if (updRes3.ok) {
          const updJson3 = await updRes3.json().catch(() => ({}));
          if (updJson3 && updJson3.success) return { success: true };
        }
      } catch(e) {}
    }

    return { success: false, error: "Failed to update client via APIs" };
  } catch(e: any) {
    return { success: false, error: e.message };
  }
}
`;

if (!content.includes('async function extendVpnClientApi')) {
  content = content.replace('async function deleteVpnClientApi', extendCode + '\nasync function deleteVpnClientApi');
}

content = content.replace(
  `                await deleteVpnClientApi(clientName, serverId);
                const addResult = await addVpnClientApi(
                  clientName,
                  newLimitGb,
                  remainingDays,
                  settings,
                  k.clientUuid,
                  serverId,
                  true
                );`,
  `                const addResult = await extendVpnClientApi(
                  clientName,
                  customGb,
                  customDays,
                  k.clientUuid,
                  serverId
                );`
);

content = content.replace(
  `                  k.subLink = addResult.subLink;`,
  `                  // k.subLink = addResult.subLink; // SubLink remains the same`
);

content = content.replace(
  `                  tx._generatedSubLink = addResult.subLink;`,
  `                  tx._generatedSubLink = k.subLink;`
);

fs.writeFileSync(file, content);
console.log("Patched server.ts");
