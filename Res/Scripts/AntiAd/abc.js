/********************************
ABC Remove Ad Images - Version 1.1
Please note that you may need to reinstall app for script to work.
********************************/

const CONFIG = {
    MIN_SPLASH_RATIO: 1.82,
    MAX_SPLASH_RATIO: 2.25,
    MIN_SPLASH_WIDTH: 1000,
    MIN_SPLASH_HEIGHT: 2000,
    MIN_FLOAT_RATIO: 1.11,
    MAX_FLOAT_RATIO: 1.12,
    MIN_FLOAT_WIDTH: 180,
    MIN_FLOAT_HEIGHT: 200,
    MIN_POP_RATIO: 1.25,
    MAX_POP_RATIO: 1.26,
    MIN_POP_WIDTH: 570,
    MIN_POP_HEIGHT: 700,
    MIN_BANNER_RATIO: 0.68,
    MAX_BANNER_RATIO: 0.70,
    MIN_BANNER_WIDTH: 750,
    MIN_BANNER_HEIGHT: 514

};

const SIG = {
    JPEG: [0xFF, 0xD8],
    PNG: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    GIF: [0x47, 0x49, 0x46, 0x38],
    RIFF: [0x52, 0x49, 0x46, 0x46],
    WEBP: [0x57, 0x45, 0x42, 0x50],
};

const JPEG_SOF = new Set([
    0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7,
    0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF,
]);

/* -------------------- 基础工具 -------------------- */

const startsWith = (b, sig, offset = 0) =>
    sig.every((v, i) => b[offset + i] === v);

const u16be = (b, i) => (b[i] << 8) | b[i + 1];

const u32be = (b, i) =>
    ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;

const isJpegStandalone = m =>
    m === 0xD8 || m === 0xD9 || m === 0x01 || (m >= 0xD0 && m <= 0xD7);

function getBytes() {
    const body = $response.bodyBytes || $response.body;
    if (!body) return null;

    if (body instanceof Uint8Array) return body;
    if (body instanceof ArrayBuffer) return new Uint8Array(body);
    if (ArrayBuffer.isView(body))
        return new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
    if (Array.isArray(body)) return new Uint8Array(body);

    return null;
}

/* -------------------- 图片尺寸识别 -------------------- */

function getJpegSize(b) {
    if (!b || b.length < 10 || !startsWith(b, SIG.JPEG)) return null;

    let i = 2;
    while (i + 9 < b.length) {
        if (b[i] !== 0xFF) { i++; continue; }

        const marker = b[i + 1];
        i += 2;

        if (isJpegStandalone(marker)) continue;
        if (i + 1 >= b.length) break;

        const len = u16be(b, i);
        if (len < 2 || i + len > b.length) break;

        if (JPEG_SOF.has(marker)) {
            return {
                format: "JPEG",
                width: u16be(b, i + 5),
                height: u16be(b, i + 3),
            };
        }

        i += len;
    }
    return null;
}

function getPngSize(b) {
    if (!b || b.length < 24 || !startsWith(b, SIG.PNG)) return null;

    return {
        format: "PNG",
        width: u32be(b, 16),
        height: u32be(b, 20),
    };
}

function getGifSize(b) {
    if (!b || b.length < 10 || !startsWith(b, SIG.GIF)) return null;
    if (b[4] !== 0x37 && b[4] !== 0x39) return null;
    if (b[5] !== 0x61) return null;

    return {
        format: "GIF",
        width: b[6] | (b[7] << 8),
        height: b[8] | (b[9] << 8),
    };
}

function getWebpSize(b) {
    if (!b || b.length < 30) return null;
    if (!startsWith(b, SIG.RIFF) || !startsWith(b, SIG.WEBP, 8)) return null;

    const type = String.fromCharCode(b[12], b[13], b[14], b[15]);

    if (type === "VP8X") {
        return {
            format: "WebP",
            width: 1 + b[24] + (b[25] << 8) + (b[26] << 16),
            height: 1 + b[27] + (b[28] << 8) + (b[29] << 16),
        };
    }

    if (type === "VP8L" && b[20] === 0x2F) {
        const bits =
            (b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24)) >>> 0;

        return {
            format: "WebP",
            width: (bits & 0x3FFF) + 1,
            height: ((bits >>> 14) & 0x3FFF) + 1,
        };
    }

    if (type === "VP8 " && b[23] === 0x9D && b[24] === 0x01 && b[25] === 0x2A) {
        return {
            format: "WebP",
            width: (b[26] | (b[27] << 8)) & 0x3FFF,
            height: (b[28] | (b[29] << 8)) & 0x3FFF,
        };
    }

    return null;
}

/* -------------------- 统一识别入口 -------------------- */

const DETECTORS = [getJpegSize, getPngSize, getWebpSize, getGifSize];

function getImageSize(b) {
    for (const detect of DETECTORS) {
        const size = detect(b);
        if (size) return size;
    }
    return null;
}

/* -------------------- 判定规则 -------------------- */

const RULES = [
    {
        name: "FLOAT",
        minW: CONFIG.MIN_FLOAT_WIDTH,
        minH: CONFIG.MIN_FLOAT_HEIGHT,
        minR: CONFIG.MIN_FLOAT_RATIO,
        maxR: CONFIG.MAX_FLOAT_RATIO,
    },
    {
        name: "POP",
        minW: CONFIG.MIN_POP_WIDTH,
        minH: CONFIG.MIN_POP_HEIGHT,
        minR: CONFIG.MIN_POP_RATIO,
        maxR: CONFIG.MAX_POP_RATIO,
    },
    {
        name: "SPLASH",
        minW: CONFIG.MIN_SPLASH_WIDTH,
        minH: CONFIG.MIN_SPLASH_HEIGHT,
        minR: CONFIG.MIN_SPLASH_RATIO,
        maxR: CONFIG.MAX_SPLASH_RATIO,
    },
    {
        name: "BANNER",
        minW: CONFIG.MIN_BANNER_WIDTH,
        minH: CONFIG.MIN_BANNER_HEIGHT,
        minR: CONFIG.MIN_BANNER_RATIO,
        maxR: CONFIG.MAX_BANNER_RATIO,
    },
];

const matches = (img, ratio, r) =>
    img.width  >= r.minW &&
    img.height >= r.minH &&
    ratio >= r.minR &&
    ratio <= r.maxR;

const BLOCKED = { status: 204, headers: {}, body: "" };

/* -------------------- 主流程 -------------------- */

(function main() {
    const bytes = getBytes();
    const img = bytes && getImageSize(bytes);

    if (!img || !img.width) return $done({});
    const url = $request.url;
    const ratio = img.height / img.width;

    /*console.log(
        `[imageInfo] ${img.format} ${img.width}x${img.height} ` +
        `ratio=${ratio.toFixed(3)} / ${bytes.length} bytes` +
        `,url= ${url}` 
    );*/

    const hit = RULES.find(r => matches(img, ratio, r));
    $done(hit ? BLOCKED : {});
})();