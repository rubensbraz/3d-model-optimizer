# Otimizador de Modelos 3D (Compressor GLB)

[English](./README.md)

**3D Model Optimizer** é um utilitário Node.js autônomo, projetado para reduzir drasticamente o tamanho de arquivos de ativos 3D (.glb) para ambientes de produção web e mobile.

Utilizando um pipeline de nível empresarial alimentado pelo **glTF-Transform**, esta ferramenta aplica técnicas de compressão agressivas, porém visualmente sem perdas. É capaz de alcançar reduções de tamanho de arquivo entre **90% e 98%**, otimizando ativos para renderização de alta performance em dispositivos com memória limitada.

## Principais Funcionalidades

* **Compressão Draco:** Implementa a compressão de geometria Draco do Google (método Edgebreaker) com configurações de quantização de alta precisão para minimizar o tamanho da geometria sem artefatos visíveis.
* **Reamostragem de Texturas:** Redimensiona automaticamente texturas de alta resolução (4K/8K) para resoluções otimizadas para mobile (padrão: 1024px).
* **Conversão WebP:** Converte texturas pesadas PNG/JPEG para o formato moderno WebP usando a engine `sharp`, reduzindo significativamente o uso de memória de vídeo.
* **Limpeza Estrutural:** Realiza uma limpeza profunda na hierarquia glTF, removendo nós não utilizados, acessadores duplicados e materiais não referenciados (`dedup` & `prune`).
* **Relatório Detalhado:** Gera um relatório completo no console comparando o tamanho do arquivo e estatísticas estruturais (texturas, malhas, acessadores) antes e depois da otimização.

## Instalação

Esta ferramenta opera como um script autônomo e não requer integração com a configuração de um projeto maior.

1. **Inicialize o diretório do projeto:**

    ```bash
    mkdir 3d-model-optimizer
    cd 3d-model-optimizer
    npm init -y
    ```

2. **Instale as dependências necessárias:**

    ```bash
    npm install @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions sharp draco3d
    ```

3. **Configure o script:**

    Salve o código de otimização fornecido como `optimize.js` na raiz do projeto.

## Uso

1. **Posicione seu arquivo:**

    Copie seu arquivo `.glb` de alta resolução para a pasta do projeto (ex: `models/input.glb`).

2. **Configure:**

    Abra o arquivo `optimize.js` e edite o objeto `CONFIG` no topo do arquivo para atender aos seus requisitos:

    ```javascript
    const CONFIG = {
        // Resolução alvo da textura (1024 é recomendado para mobile)
        TEXTURE_RESOLUTION: 1024,
        
        // Qualidade da compressão WebP (1-100)
        TEXTURE_QUALITY: 100,
        
        // Caminho do arquivo de entrada
        INPUT_FILE: 'models/modelo_high_res.glb',
        
        // Caminho do arquivo de saída
        OUTPUT_FILE: 'models/modelo_mobile.glb'
    };
    ```

3. **Execute o otimizador:**

    ```bash
    node optimize.js
    ```

## Exemplo de Resultado

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

## Licença

Este projeto está licenciado sob a Licença MIT.

**Autor:** Rubens Braz
