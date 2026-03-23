const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

// Fetch Cinemeta
async function getMeta(id) {
    const res = await fetch(`https://v3-cinemeta.strem.io/meta/series/${id}.json`);
    const json = await res.json();
    return json.meta;
}

// Format S01E01
function formatEpisode(season, episode) {
    const s = String(season || 0).padStart(2, "0");
    const e = String(episode || 0).padStart(2, "0");
    return `S${s}E${e}`;
}

const builder = new addonBuilder({
    id: "org.example.spoilerfree.configurable",
    version: "3.0.0",
    name: "Spoiler-Free Mode",
    description: "Configurable anti-spoiler system",
    resources: ["meta", "catalog"],
    types: ["series"],
    idPrefixes: ["tt"],

    catalogs: [
        {
            type: "series",
            id: "spoiler-free",
            name: "Spoiler Free"
        }
    ],

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

// REQUIRED catalog handler
builder.defineCatalogHandler(() => {
    return Promise.resolve({ metas: [] });
});

// META HANDLER
builder.defineMetaHandler(async ({ id, type, config }) => {
    console.log("🚀 META REQUEST:", id, config);

    if (type !== "series") return { meta: null };

    try {
        const meta = await getMeta(id);
        if (!meta) return { meta: null };

        // if disabled → return original
        if (!config || config.enabled === false) {
            return { meta };
        }

        const mode = config.mode || "standard";

        const cleanVideos = (meta.videos || []).map(ep => {
            const base = {
                id: ep.id,
                season: ep.season,
                episode: ep.episode,
                released: ep.released || null
            };

            // MINIMAL → only hide descriptions
            if (mode === "minimal") {
                return {
                    ...base,
                    title: ep.title,
                    overview: "",
                    description: "",
                    plot: ""
                };
            }

            // STANDARD → hide title + description
            if (mode === "standard") {
                return {
                    ...base,
                    title: formatEpisode(ep.season, ep.episode),
                    overview: "",
                    description: "",
                    plot: ""
                };
            }

            // AGGRESSIVE → full strip
            if (mode === "aggressive") {
                return {
                    ...base,
                    title: formatEpisode(ep.season, ep.episode),
                    overview: "",
                    description: "",
                    plot: "",
                    synopsis: "",
                    thumbnail: undefined
                };
            }

            return ep;
        });

        return {
            meta: {
                ...meta,
                videos: cleanVideos,

                // also clean series-level text
                description: mode === "minimal" ? meta.description : "",
                overview: "",
                plot: ""
            }
        };

    } catch (err) {
        console.error("ERROR:", err);
        return { meta: null };
    }
});

module.exports = builder.getInterface();