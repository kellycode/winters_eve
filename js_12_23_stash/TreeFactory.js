class TreeFactory {
    
    constructor(three) {
        this.THREE = three;
    }

    simpleTree(treeTexture) {

        let THREE = this.THREE;
        let treeMaterial;
        
        if (!THREE) {
            let THREE = {};
            console.error('THREE is not loaded for tree.js');
        }

        // use the tree texture if we have one
        if (treeTexture) {
            const H_REP = 2;
            const W_REP = 12;
            treeTexture.wrapS = THREE.RepeatWrapping;
            treeTexture.wrapT = THREE.RepeatWrapping;
            treeTexture.repeat.set(W_REP, H_REP);
            treeMaterial = new THREE.MeshLambertMaterial({map: treeTexture, transparent: true});
        }
        // or just use a color
        else {
            treeMaterial = new THREE.MeshLambertMaterial({color: 0x2d4c1e});
        }

        // making some cones with some small variations and rotations and stacking them
        // radiusTop, radiusBottom, height, radialSegments, openEnded
        let c1 = new THREE.Mesh(new THREE.CylinderGeometry(0, 14, 10, 10, 2, true), treeMaterial);
        c1.position.y = 6;
        c1.rotation.y = Math.random() * Math.PI;

        let c2 = new THREE.Mesh(new THREE.CylinderGeometry(0, 12, 10, 11, 2, true), treeMaterial);
        c2.position.y = 9;
        c2.castShadow = true;
        c2.rotation.y = Math.random() * Math.PI;

        let c3 = new THREE.Mesh(new THREE.CylinderGeometry(0, 10, 10, 10, 2, true), treeMaterial);
        c3.position.y = 12;
        c3.rotation.y = Math.random() * Math.PI;

        let c4 = new THREE.Mesh(new THREE.CylinderGeometry(0, 9, 8, 11, 2, true), treeMaterial);
        c4.position.y = 15;
        c4.rotation.y = Math.random() * Math.PI;

        let c5 = new THREE.Mesh(new THREE.CylinderGeometry(0, 8, 8, 10, 2, true), treeMaterial);
        c5.position.y = 18;
        c5.rotation.y = Math.random() * Math.PI;

        let c6 = new THREE.Mesh(new THREE.CylinderGeometry(0, 7, 8, 10, 2, true), treeMaterial);
        c6.position.y = 21;
        c6.rotation.y = Math.random() * Math.PI;

        let c7 = new THREE.Mesh(new THREE.CylinderGeometry(0, 5, 9, 10, 2, true), treeMaterial);
        c7.position.y = 24;
        c7.rotation.y = Math.random() * Math.PI;
        
        // just need the top bit to cast a shadow
        c1.castShadow = true;
        c2.castShadow = true;

        // group em up
        const group = new THREE.Group();
        group.add(c1);
        group.add(c2);
        group.add(c3);
        group.add(c4);
        group.add(c5);
        group.add(c6);
        group.add(c7);
        
        group.updateMatrix();

        return group;
    }
}