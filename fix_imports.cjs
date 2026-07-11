const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

code = code.replace(
  '  Globe\n} from "lucide-react";',
  '  Globe,\n  Power,\n  RotateCw\n} from "lucide-react";'
);
fs.writeFileSync('src/components/DashboardOverview.tsx', code);
