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
    id: "org.spoilerfirewall.global" + Date.now(),
    version: "4.0.0",
    name: "Spoiler Firewall",
    description: "Global anti-spoiler layer for Stremio",
    resources: ["meta", "catalog"],
    types: ["series"],
    idPrefixes: ["tt"],

    catalogs: [
        {
            type: "series",
            id: "firewall",
            name: "Spoiler Firewall"
        }
    ],

    behaviorHints: {
        configurable: true
        configurationRequired: true
    },

    config: [
        {
            key: "enabled",
            type: "checkbox",
            title: "Enable Spoiler Free Mode",
            default: false
        },
        {
            key: "mode",
            type: "select",
            title: "Protection Level:\nminimal = hide descriptions\nstandard = hide titles + descriptions\naggressive = hide thumbnails + dates\nparanoid              = maximum protection",
            description:
                 "Minimal: hides episode descriptions only.\n" +
                 "Standard: hides titles and descriptions.\n" +
                 "Aggressive: also hides thumbnails and air dates.\n" +
                 "Paranoid: maximum protection, removes almost all episode info.",
            options: ["minimal", "standard", "aggressive", "paranoid"],
            default: "standard"
        }
    ]
});

// Required catalog handler
builder.defineCatalogHandler(() => {
    return Promise.resolve({ metas: [] });
});

// GLOBAL META FIREWALL
builder.defineMetaHandler(async ({ id, type, config }) => {
    console.log("🛡️ FIREWALL HIT:", id, config);

    if (type !== "series") return { meta: null };

    try {
        const meta = await getMeta(id);
        if (!meta) return { meta: null };

        if (!config || config.enabled === false) {
            return { meta };
        }

        const mode = config.mode || "standard";

        const cleanVideos = (meta.videos || []).map(ep => {
            const base = {
                id: ep.id,
                season: ep.season,
                episode: ep.episode
            };

            // MINIMAL → hide episode description only
            if (mode === "minimal") {
                return {
                    ...base,
                    title: ep.title,
                    overview: "",
                    description: "",
                    plot: ""
                };
            }

            // STANDARD → hide titles + descriptions
            if (mode === "standard") {
                return {
                    ...base,
                    title: formatEpisode(ep.season, ep.episode),
                    overview: "",
                    description: "",
                    plot: ""
                };
            }

            // AGGRESSIVE → remove visuals + metadata
            if (mode === "aggressive") {
                return {
                    ...base,
                    title: formatEpisode(ep.season, ep.episode),
                    overview: "",
                    description: "",
                    plot: "",
                    synopsis: "",
                    released: null,
                    thumbnail: undefined
                };
            }

            // PARANOID → absolute spoiler lockdown
            if (mode === "paranoid") {
                return {
                    id: ep.id,
                    season: ep.season,
                    episode: ep.episode,
                    title: `Episode ${ep.episode}`,
                    overview: "",
                    description: "",
                    plot: "",
                    synopsis: "",
                    released: null,
                    thumbnail: undefined
                };
            }

            return ep;
        });

        return {
            meta: {
                id: meta.id,
                type: meta.type,
                name: meta.name,

                // strip series-level spoilers for paranoid level only
                description:  mode === "paranoid" ? "" : meta.description,
                overview: mode === "paranoid" ? "" : meta.overview,
                plot: mode === "paranoid" ? "" : meta.plot,
                tagline: mode === "paranoid" ? "" : meta.mode,

                // keep safe UI fields
                poster: meta.poster,
                background: mode === "paranoid" ? undefined : meta.background,

                videos: cleanVideos
            }
        };

    } catch (err) {
        console.error("FIREWALL ERROR:", err);
        return { meta: null };
    }
});

module.exports = builder.getInterface();