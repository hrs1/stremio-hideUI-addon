const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

// 🔥 Minimal test addon (no external fetch, no errors possible)
const builder = new addonBuilder({
    id: "org.test.spoilerfree",
    version: "1.0.0",
    name: "Test Addon",
    resources: ["meta"],
    types: ["series"],
    idPrefixes: ["tt"],
    catalogs: [],
    behaviorHints: { configurable: true },
    config: [
        {
            key: "mode",
            type: "select",
            title: "Mode",
            options: ["minimal", "standard", "aggressive"],
            default: "standard"
        }
    ]
});

builder.defineMetaHandler(() => {
    return { meta: null };
});

const PORT = process.env.PORT || 10000;

serveHTTP(builder.getInterface(), {
    port: PORT,
    host: "0.0.0.0"
});

console.log("✅ Server started on port:", PORT);