const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

// Fetch Cinemeta data
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
    id: "org.example.spoilerfree.hardmode",
    version: "2.0.0",
    name: "Spoiler-Free Hard Mode",
    description: "Completely removes episode titles and descriptions",
    resources: ["meta", "catalog"],
    types: ["series"],
    idPrefixes: ["tt"],

    catalogs: [
        {
            type: "series",
            id: "spoiler-free",
            name: "Spoiler Free"
        }
    ]
});

// REQUIRED catalog handler
builder.defineCatalogHandler(() => {
    console.log("📦 CATALOG REQUEST");
    return Promise.resolve({ metas: [] });
});

// HARD META OVERRIDE (full rebuild)
builder.defineMetaHandler(async ({ id, type }) => {
    console.log("🚀 META REQUEST:", id);

    if (type !== "series") return { meta: null };

    try {
        const meta = await getMeta(id);
        if (!meta) return { meta: null };

        // rebuild episodes from scratch (IMPORTANT PART)
        const cleanVideos = (meta.videos || []).map(ep => {
            return {
                id: ep.id,
                season: ep.season,
                episode: ep.episode,

                // ONLY safe visible label
                title: formatEpisode(ep.season, ep.episode),

                // STRIP EVERYTHING SPOILER-LIKE
                overview: "",
                description: "",
                plot: "",
                synopsis: "",
                released: ep.released || null,

                // optional safe fields (keeps UI stable)
                thumbnail: ep.thumbnail || undefined
            };
        });

        // return completely controlled meta object
        return {
            meta: {
                ...meta,

                // overwrite episode list completely
                videos: cleanVideos,

                // optionally reduce spoiler surface
                description: "",
                plot: "",
                overview: ""
            }
        };

    } catch (err) {
        console.error("ERROR:", err);
        return { meta: null };
    }
});

module.exports = builder.getInterface();