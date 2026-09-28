const fs = require('fs');
let content = fs.readFileSync('admin_apk/lib/screens/main_navigation.dart', 'utf-8');

content = content.replace("import 'meeting_points_screen.dart';", "");

const startStr = "              ListTile(\r\n                leading: const Icon(Icons.location_on),\r\n                title: const Text('Meeting Points'),";
const endStr = "              ),";

const sIdx = content.indexOf("ListTile(\r\n                leading: const Icon(Icons.location_on),\r\n                title: const Text('Meeting Points')");
if(sIdx !== -1) {
    const eIdx = content.indexOf("              ),", sIdx) + 16;
    content = content.substring(0, sIdx) + content.substring(eIdx);
} else {
    // Try \n
    const sIdx2 = content.indexOf("ListTile(\n                leading: const Icon(Icons.location_on),\n                title: const Text('Meeting Points')");
    if(sIdx2 !== -1) {
        const eIdx2 = content.indexOf("              ),", sIdx2) + 16;
        content = content.substring(0, sIdx2) + content.substring(eIdx2);
    }
}

fs.writeFileSync('admin_apk/lib/screens/main_navigation.dart', content);
