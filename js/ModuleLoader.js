/*
ModuleLoader helps old projects use new modules

Simply loads the module and makes it look like a normal
window js object and then adds the scripts that use it.
*/

import * as THREE from "three";
import { OrbitControls } from './THREE/three_r170/OrbitControls.js';
import { GLTFLoader } from './THREE/three_r170//GLTFLoader.js';
import Stats  from './THREE/three_r170/stats.module.js';


class ModuleLoader {
    static init() {

        window.THREE = THREE;
        window.OrbitControls = OrbitControls;
        window.GLTFLoader = GLTFLoader;
        window.Stats = Stats;

        function appendScript(path) {
            // 1. Create a new script element
            const script = document.createElement("script");
            // 2. Set the source of the script
            script.src = path;
            // 3. Optionally set other attributes (e.g., async, defer)
            script.async = false; // Load the script asynchronously
            script.defer = true; // Load the script asynchronously
            // 4. Append the script to the head of the document
            document.head.appendChild(script);
        }

        /*
        former index.html script loads
        <!-- Classes -->
        <script src="js/Animator.js" ></script>
        <script src="js/Constants.js" ></script>
        <script src="js/SetManager.js" ></script>
        <script src="js/PixelData.js" ></script>
        <script src="js/PropManager.js" ></script>
        <script src="js/PreloadManager.js" ></script>
        <script src="js/ActorManager.js" ></script>
        <script src="js/TreeFactory.js" ></script>
        <script src="js/MouseMoveEvents.js" ></script>
        <script src="js/PlayerKeyControls.js" ></script>
        <script src="js/PlayerTouchControls.js" ></script>
        <!-- Main -->
        <script src="js/main.js" ></script>
        */

        // now loaded after modules
        appendScript("js/Animator.js");
        appendScript("js/Constants.js");
        appendScript("js/SetManager.js");
        appendScript("js/PixelData.js");
        appendScript("js/PropManager.js");
        appendScript("js/PreloadManager.js");
        appendScript("js/ActorManager.js");
        appendScript("js/TreeFactory.js");
        appendScript("js/MouseMoveEvents.js");
        appendScript("js/PlayerKeyControls.js");
        appendScript("js/PlayerTouchControls.js");
        // where it starts
        appendScript("js/main.js");
        
    }
}

export { ModuleLoader };
