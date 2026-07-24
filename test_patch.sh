sed -i '6291,6292d' server.ts
sed -i '6292i\
        if (trafficJson && trafficJson.success && Array.isArray(trafficJson.obj)) {' server.ts
