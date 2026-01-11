# 3D Model Optimizer (GLB Compressor)

[Português](./README_pt.md)

**3D Model Optimizer** is a standalone Node.js utility designed to drastically reduce the file size of 3D assets (.glb) for web and mobile production environments.

Leveraging an enterprise-grade pipeline powered by **glTF-Transform**, this tool applies aggressive yet visually lossless compression techniques. It is capable of achieving file size reductions between **90% and 98%**, optimizing assets for high-performance rendering on devices with limited memory.

## Key Features

* **Draco Compression:** Implements Google's Draco geometry compression (Edgebreaker method) with high-precision quantization settings to minimize geometry size without visible artifacts.
* **Texture Resampling:** Automatically resizes high-resolution textures (4K/8K) to mobile-friendly resolutions (default: 1024px).
* **WebP Conversion:** Converts heavy PNG/JPEG textures to the modern WebP format using the `sharp` engine, significantly reducing video memory usage.
* **Structural Cleanup:** Performs deep cleaning of the glTF hierarchy by removing unused nodes, duplicate accessors, and unreferenced materials (`dedup` & `prune`).
* **Detailed Reporting:** Generates a comprehensive console report comparing file size and structural statistics (textures, meshes, accessors) before and after optimization.

## Installation

This tool operates as a standalone script and does not require integration into a larger project configuration.

1. **Initialize the project directory:**

    ```bash
    mkdir 3d-model-optimizer
    cd 3d-model-optimizer
    npm init -y
    ```

2. **Install required dependencies:**

    ```bash
    npm install @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions sharp draco3d
    ```

3. **Setup the script:**

    Save the provided optimization code as `optimize.js` in the project root directory.

## Usage

1. **Place your file:**

    Copy your high-resolution `.glb` file into the project folder (e.g., `models/input.glb`).

2. **Configure:**

    Open `optimize.js` and edit the `CONFIG` object at the top of the file to match your requirements:

    ```javascript
    const CONFIG = {
        // Target texture resolution (1024 is recommended for mobile)
        TEXTURE_RESOLUTION: 1024,
        
        // WebP compression quality (1-100)
        TEXTURE_QUALITY: 100,
        
        // Input file path
        INPUT_FILE: 'models/high_res_model.glb',
        
        // Output file path
        OUTPUT_FILE: 'models/mobile_optimized_model.glb'
    };
    ```

3. **Run the optimizer:**

    ```bash
    node optimize.js
    ```

## Example Output

```text
------------------------------------------------------------
OPTIMIZATION REPORT
------------------------------------------------------------
Input:   models/angelim.glb
Output:  models/angelim_mobile.glb
Time:    3.04s
------------------------------------------------------------
FILE SIZE
Original:   275.28 MB
Optimized:  7.72 MB
Reduction:  97.20%
------------------------------------------------------------
STRUCTURE          BEFORE     AFTER      DIFF
Textures           15         15         -
Materials          6          6          -
Meshes             4          4          -
Nodes              4          4          -
Accessors          33         27         -6
Animations         0          0          -
------------------------------------------------------------
```

## License

This project is licensed under the MIT License.

**Author:** Rubens Braz
