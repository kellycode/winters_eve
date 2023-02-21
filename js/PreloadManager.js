class PreloadManager
{
    constructor(THREE, CONSTANTS) {
        this.THREE = THREE;
        this.CONSTANTS = CONSTANTS;
    }
    
    preloadModels(M_PRELOADS, setPreloadCompletions) {
        let gltfLoader = new THREE.GLTFLoader().setPath("assets/models/");
        let modelPromises = [];
        
        M_PRELOADS.forEach((modelName) => {
            console.log(modelName)
            modelPromises.push(gltfLoader.loadAsync(modelName));
        });

        Promise.all(modelPromises).then((results) => {
            // models returned in same order as requested
            setPreloadCompletions(results, 'models');

        }).catch((err) => {
            console.log(err);
        }); 
    }
    
    preloadTextures(T_PRELOADS, setPreloadCompletions) {
        let textureLoader = new this.THREE.TextureLoader();
        let texturePromises = [];
        
        T_PRELOADS.forEach((path) => {
            //let t_name = path.split(/[/.]/)[1];
            texturePromises.push(textureLoader.load(path));
        });

        Promise.all(texturePromises).then((results) => {
            // models returned in same order as requested
            setPreloadCompletions(results, 'textures');

        }).catch((err) => {
            console.log(err);
        }); 
    }
}
