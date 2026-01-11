const fs = require('fs');
const path = require('path');
const { NodeIO } = require('@gltf-transform/core');
const { KHRONOS_EXTENSIONS } = require('@gltf-transform/extensions');
const {
    resample,
    prune,
    dedup,
    draco,
    textureCompress
} = require('@gltf-transform/functions');
const sharp = require('sharp');
const draco3d = require('draco3d');

// --- CONFIGURATION ---
const CONFIG = {
    TEXTURE_RESOLUTION: 1024,
    TEXTURE_QUALITY: 100, // WebP quality (lossy)
    INPUT_FILE: 'models/jatoba.glb',
    OUTPUT_FILE: 'models/jatoba_mobile.glb'
};

// --- UTILS ---

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
};

const calculateReduction = (original, final) => {
    return ((1 - (final / original)) * 100).toFixed(2) + '%';
};

/**
 * Extracts structural statistics from a GLTF document.
 */
function analyzeDocument(document) {
    const root = document.getRoot();
    return {
        textures: root.listTextures().length,
        materials: root.listMaterials().length,
        meshes: root.listMeshes().length,
        nodes: root.listNodes().length,
        accessors: root.listAccessors().length,
        animations: root.listAnimations().length
    };
}

/**
 * Prints a comparative report between two states.
 */
function printReport(preStats, postStats, originalSize, finalSize, duration) {
    const width = 60;
    const line = '-'.repeat(width);

    console.log(`\n${line}`);
    console.log(`OPTIMIZATION REPORT`);
    console.log(line);
    console.log(`Input:  ${CONFIG.INPUT_FILE}`);
    console.log(`Output: ${CONFIG.OUTPUT_FILE}`);
    console.log(`Time:   ${(duration / 1000).toFixed(2)}s`);
    console.log(line);

    console.log(`FILE SIZE`);
    console.log(`Original:   ${formatBytes(originalSize)}`);
    console.log(`Optimized:  ${formatBytes(finalSize)}`);
    console.log(`Reduction:  ${calculateReduction(originalSize, finalSize)}`);
    console.log(line);

    console.log(`STRUCTURE          BEFORE     AFTER      DIFF`);
    const metrics = ['textures', 'materials', 'meshes', 'nodes', 'accessors', 'animations'];

    metrics.forEach(key => {
        const before = preStats[key];
        const after = postStats[key];
        const diff = after - before;
        const diffStr = diff === 0 ? '-' : diff > 0 ? `+${diff}` : diff.toString();

        console.log(
            `${key.charAt(0).toUpperCase() + key.slice(1).padEnd(18)} ` +
            `${formatNumber(before).padEnd(10)} ` +
            `${formatNumber(after).padEnd(10)} ` +
            `${diffStr}`
        );
    });
    console.log(line);
    console.log(`OPERATIONS APPLIED`);
    console.log(`* Dedup: Removed duplicate accessors and textures`);
    console.log(`* Prune: Removed unused graph nodes`);
    console.log(`* Resample: Textures resized to max ${CONFIG.TEXTURE_RESOLUTION}px`);
    console.log(`* Compress: Converted textures to WebP (Q${CONFIG.TEXTURE_QUALITY})`);
    console.log(`* Draco: Applied geometry compression (Quantization enabled)`);
    console.log(line + '\n');
}

// --- MAIN PIPELINE ---

async function main() {
    const startTime = performance.now();
    console.log(`Initializing optimization pipeline...`);

    // 1. Initialize Draco dependencies
    const encoderModule = await draco3d.createEncoderModule({});
    const decoderModule = await draco3d.createDecoderModule({});

    // 2. Configure IO
    const io = new NodeIO()
        .registerExtensions(KHRONOS_EXTENSIONS)
        .registerDependencies({
            'draco3d.decoder': decoderModule,
            'draco3d.encoder': encoderModule,
        });

    const inputPath = path.resolve(CONFIG.INPUT_FILE);
    const outputPath = path.resolve(CONFIG.OUTPUT_FILE);

    // 3. Validation
    if (!fs.existsSync(inputPath)) {
        throw new Error(`Input file not found: ${inputPath}`);
    }

    // 4. Load Document
    const originalSize = fs.statSync(inputPath).size;
    console.log(`Reading document...`);
    const document = await io.read(inputPath);

    // Capture pre-optimization statistics
    const preStats = analyzeDocument(document);

    // 5. Execute Transforms
    console.log(`Processing assets (this may take a moment)...`);

    await document.transform(
        // Structural cleanup
        dedup(),
        prune(),

        // Texture optimization
        resample({
            ready: resample.ready,
            width: CONFIG.TEXTURE_RESOLUTION,
            height: CONFIG.TEXTURE_RESOLUTION
        }),

        textureCompress({
            encoder: sharp,
            targetFormat: 'webp',
            resize: [CONFIG.TEXTURE_RESOLUTION, CONFIG.TEXTURE_RESOLUTION],
            quality: CONFIG.TEXTURE_QUALITY,
        }),

        // Geometry optimization
        draco({
            method: 'edgebreaker',
            quantizePosition: 14,
            quantizeNormal: 10,
            quantizeTexcoord: 12,
            quantizeColor: 8,
            quantizeGeneric: 12,
        })
    );

    // Capture post-optimization statistics
    const postStats = analyzeDocument(document);

    // 6. Write Output
    console.log(`Writing to disk...`);
    await io.write(outputPath, document);

    const finalSize = fs.statSync(outputPath).size;
    const endTime = performance.now();

    // 7. Generate Detailed Report
    printReport(preStats, postStats, originalSize, finalSize, endTime - startTime);
}

main().catch((err) => {
    console.error(`\nFATAL ERROR: ${err.message}`);
    process.exit(1);
});