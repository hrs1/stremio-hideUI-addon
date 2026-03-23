const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

// Simple in-memory cache (FIXED)
const cache = new Map();

async function getCache(id) {
    return cache.get(id);
}

async function setCache(id, value) {
    cache.set(id, value);
}

// Fetch metadata
async function getMeta(id) {
    const cached = await getCache(id);
    if (cached) return cached;

    const res = await fetch(`https://v3-cinemeta.strem.io/meta/series/${id}.json`);
    const json = await res.json();

    await setCache(id, json.meta);
    return json.meta;
}

// Format S01E01
function formatEpisode(season, episode) {
    const s = String(season || 0).padStart(2, "0");
    const e = String(episode || 0).padStart(2, "0");
    return `S${s}E${e}`;
}

const builder = new addonBuilder({
    id: "org.example.spoilerfree.v5",
    version: "3.0.1",
    name: "Spoiler-Free Mode",
    description: "Hide episode spoilers with configurable levels",
    resources: ["meta"],
    types: ["series"],
    idPrefixes: ["tt"],
    catalogs: [],

    behaviorHints: {
        configurable: true
    },

    config: [
        {
            key: "enabled",
            type: "checkbox",
            title: "Enable Spoiler-Free Mode",
            default: true
        },
        {
            key: "mode",
            type: "select",
            title: "Spoiler Level",
            options: ["minimal", "standard", "aggressive"],
            default: "standard"
        }
    ]
});

builder.defineMetaHandler(async ({ id, type, config }) => {
    console.log("META REQUEST:", id, config);

    if (type !== "series") return { meta: null };

    try {
        const meta = await getMeta(id);
        if (!meta || !meta.videos) return { meta };

        if (!config?.enabled) return { meta };

        meta.videos = meta.videos.map(ep => {
            let newEp = { ...ep };

            const mode = config.mode || "standard";

            if (mode === "minimal") {
                newEp.overview = "";
            }

            if (mode === "standard") {
                newEp.title = formatEpisode(ep.season, ep.episode);
                newEp.overview = "";
            }

            if (mode === "aggressive") {
                newEp.title = formatEpisode(ep.season, ep.episode);
                newEp.overview = "";
                newEp.thumbnail = "";
                newEp.released = null;
            }

            return newEp;
        });

        return { meta };

    } catch (err) {
        console.error("ERROR:", err);
        return { meta: null };
    }
});

module.exports = builder.getInterface();