import fs from "fs";
const file = "server.ts";
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  `    // 1. Delete old client on panel
    await deleteVpnClientApi(clientName, key.serverId);

    // 2. Add new client on panel with bypassDuplicateCheck = true
    const addResult = await addVpnClientApi(
      clientName,
      new_limit_gb,
      new_exp_days,
      settings,
      key.clientUuid,
      key.serverId,
      true
    );`,
  `    const addResult = await extendVpnClientApi(
      clientName,
      Number(addGb),
      Number(addDays),
      key.clientUuid,
      key.serverId
    );`
);

fs.writeFileSync(file, content);
console.log("Patched server.ts renew endpoint");
