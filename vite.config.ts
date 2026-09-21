import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {fileURLToPath,URL} from "node:url";
export default defineConfig({
 base:(process.env.NEXT_PUBLIC_BASE_PATH || "") + "/",
 plugins:[react()],
 resolve:{alias:{"@":fileURLToPath(new URL(".",import.meta.url))}},
 define:{"process.env.NEXT_PUBLIC_BASE_PATH":JSON.stringify(process.env.NEXT_PUBLIC_BASE_PATH || "")},
 build:{outDir:"dist/client",emptyOutDir:true},
 server:{host:"localhost",port:5173,watch:{usePolling:true}},
});
