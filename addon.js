const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

// Fetch metadata
async function getMeta(id) {
    const res = await fetch(`https://v3-cinemeta.strem.io/meta/series/${id}.json`);
    const json = await res.json();
    return json.meta;
}

// Format episode name
function formatEpisode(season, episode) {
    const s = String(season || 0).padStart(2, "0");
    const e = String(episode || 0).padStart(2, "0");
    return `S${s}E${e}`;
}

const builder = new addonBuilder({
    id: "org.example.spoilerfree",
    version: "1.0.0",
    name: "Spoiler-Free Mode",
    description: "Hides episode titles and descriptions",
    resources: ["meta"],
    types: ["series"],
    idPrefixes: ["tt"]
});

// META HANDLER (core logic)
builder.defineMetaHandler(async ({ id, type }) => {
    console.log("🚀 META REQUEST:", id);

    if (type !== "series") return { meta: null };

    try {
        const meta = await getMeta(id);
        if (!meta || !meta.videos) return { meta };

        meta.videos = meta.videos.map((ep, i) => ({
            ...ep,
            title: formatEpisode(ep.season, ep.episode),
            overview: ""
        }));

        return { meta };

    } catch (err) {
        console.error("ERROR:", err);
        return { meta: null };
    }
});

module.exports = builder.getInterface();