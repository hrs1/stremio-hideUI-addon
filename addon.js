const { addonBuilder } = require("stremio-addon-sdk");

console.log("🔥 addon.js loaded");

const builder = new addonBuilder({
    id: "org.example.spoilerfree.test",
    version: "1.0.0",
    name: "Spoiler Test",
    description: "Debug addon",
    resources: ["meta"],
    types: ["series"],
    idPrefixes: ["tt"],
    catalogs: [],
    behaviorHints: {
        configurable: true
    },
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

builder.defineMetaHandler((args) => {
    console.log("🚀 META HIT:", args);

    return Promise.resolve({ meta: null });
});

module.exports = builder.getInterface();