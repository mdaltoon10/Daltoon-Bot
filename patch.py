import re

with open('install.sh', 'r') as f:
    content = f.read()

pattern = re.compile(r'(if \[ "\$ssl_issued" = "false" \] && \[ "\$VAL_METHOD" != "1" \]; then).*?(fi\n\n        if \[ "\$ssl_issued" = "true" \]; then)', re.DOTALL)

replacement = r'''\1
            echo -e "${YELLOW}Attempting acme.sh Standalone mode...${NC}"
            
            # Check if port is in use and prompt for alternative
            while true; do
                if lsof -i:${CERT_PORT} >/dev/null 2>&1 || fuser "${CERT_PORT}/tcp" >/dev/null 2>&1; then
                    echo -e "${RED}Port ${CERT_PORT} is currently in use.${NC}"
                    read -p "Enter another port for acme.sh standalone listener (or press Enter to try killing the process): " alt_port
                    alt_port="${alt_port// /}"
                    if [ -z "$alt_port" ]; then
                        echo -e "${YELLOW}Attempting to free port ${CERT_PORT}...${NC}"
                        fuser -k -9 "${CERT_PORT}/tcp" >/dev/null 2>&1 || true
                        lsof -ti:${CERT_PORT} 2>/dev/null | xargs kill -9 2>/dev/null || true
                        sleep 2
                        if lsof -i:${CERT_PORT} >/dev/null 2>&1 || fuser "${CERT_PORT}/tcp" >/dev/null 2>&1; then
                            echo -e "${RED}Still in use. Please stop the service manually or use another port.${NC}"
                            continue
                        fi
                    elif ! [[ "${alt_port}" =~ ^[0-9]+$ ]] || ((alt_port < 1 || alt_port > 65535)); then
                        echo -e "${RED}Invalid port provided.${NC}"
                        continue
                    else
                        CERT_PORT="${alt_port}"
                        if [[ "${CERT_PORT}" -ne 80 ]]; then
                            echo -e "${YELLOW}Reminder: Let's Encrypt still reaches port 80; forward external port 80 to ${CERT_PORT} for validation.${NC}"
                        fi
                        continue
                    fi
                else
                    echo -e "${GREEN}Port ${CERT_PORT} is free and ready for standalone validation.${NC}"
                fi
                break
            done

            acme_listen_flag=""
            if ! ip -4 addr show scope global 2> /dev/null | grep -q "inet "; then
                acme_listen_flag="--listen-v6"
            fi
            
            if ~/.acme.sh/acme.sh --issue -d "$SSL_DOMAIN" $acme_listen_flag --standalone --httpport "$CERT_PORT" --force; then
                ssl_issued=true
            else
                echo -e "${RED}Standalone validation failed.${NC}"
            fi
        \2'''

new_content = pattern.sub(replacement, content)

with open('install.sh', 'w') as f:
    f.write(new_content)
