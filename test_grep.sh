sed -i '6264,6272c\
        const headers: Record<string, string> = {\
          Cookie: loginResult.cookie,\
          Accept: "application/json",\
        };\
        if (loginResult.csrfToken) {\
          headers["X-Csrf-Token"] = loginResult.csrfToken;\
        }' server.ts
