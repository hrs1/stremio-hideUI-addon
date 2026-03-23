const { addonBuilder } = require("stremio-addon-sdk");

console.log("🔥 addon.js loaded");

const builder = new addonBuilder({
    id: "org.spoilerfree.unique." + Date.now(),
    version: "1.0.0",
    name: "Spoiler Test",
    description: "Debug addon",
    resources: ["meta"],
    types: ["series"],
    idPrefixes: ["tt"],
    catalogs: [
    {
        type: "series",
        id: "spoiler-test",
        name: "Spoiler Test"
    }
],
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

builder.defineCatalogHandler(() => {
    return Promise.resolve({
        metas: []
    });
});

module.exports = builder.getInterface();