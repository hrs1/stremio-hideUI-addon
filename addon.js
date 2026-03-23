const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

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
    const s = String(season).padStart(2, "0");
    const e = String(episode).padStart(2, "0");
    return `S${s}E${e}`;
}

const builder = new addonBuilder({
    id: "org.example.spoilerfree",
    version: "3.0.0",
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
            options: [
        	"minimal (hide descriptions)",
        	"standard (hide titles + descriptions)",
        	"aggressive (hide everything)"
    	    ],
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

        if (!config || config.enabled === false) {
            return { meta };
        }

        meta.videos = meta.videos.map(ep => {
            let newEp = { ...ep };

            // MINIMAL
            if (config.mode.startsWith("minimal")) {
                newEp.overview = "";
            }

            // STANDARD
            if (config.mode.startsWith("standard")) {
                newEp.title = formatEpisode(ep.season, ep.episode);
                newEp.overview = "";
            }

            // AGGRESSIVE
            if (config.mode.startsWith("aggressive")) {
                newEp.title = formatEpisode(ep.season, ep.episode);
                newEp.overview = "";
                newEp.thumbnail = "";
                newEp.released = null;
            }

            return newEp;
        });

        return { meta };

    } catch (err) {
        console.error(err);
        return { meta: null };
    }
});

module.exports = builder.getInterface();