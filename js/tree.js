class TreeFactory {
    
    betterTree(treeTexture) {
        
    }

    simpleTree(treeTexture) {

        if (!THREE) {
            let THREE = {};
            console.error('THREE is not loaded');
        }

        let treeMaterial;

        if (treeTexture) {
            const H_REP = 2;
            const W_REP = 12;
            treeTexture.wrapS = THREE.RepeatWrapping;
            treeTexture.wrapT = THREE.RepeatWrapping;
            treeTexture.repeat.set(W_REP, H_REP);
            treeMaterial = new THREE.MeshLambertMaterial({map: treeTexture,transparent: true});
        } else {
            treeMaterial = new THREE.MeshLambertMaterial({color: 0x2d4c1e});
        }

        let material = [
            new THREE.MeshLambertMaterial({color: 0x3d2817}), // brown
            treeMaterial // green
        ];

        // radiusTop, radiusBottom, height, radialSegments
        let c0 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6, 1, true));
        c0.position.y = 6;

        let c1g = new THREE.CylinderGeometry(0, 14, 10, 10, 2, true);
        
        let c1 = new THREE.Mesh(c1g);
        c1.position.y = 10;
        c1.rotation.y = Math.random() * Math.PI;

        let c2 = new THREE.Mesh(new THREE.CylinderGeometry(0, 12, 10, 11, 2, true));
        c2.position.y = 13;
        c2.rotation.y = Math.random() * Math.PI;

        let c3 = new THREE.Mesh(new THREE.CylinderGeometry(0, 10, 10, 10, 2, true));
        c3.position.y = 16;
        c3.rotation.y = Math.random() * Math.PI;

        let c4 = new THREE.Mesh(new THREE.CylinderGeometry(0, 9, 8, 11, 2, true));
        c4.position.y = 17.5;
        c4.rotation.y = Math.random() * Math.PI;

        let c5 = new THREE.Mesh(new THREE.CylinderGeometry(0, 8, 8, 10, 2, true));
        c5.position.y = 20;
        c5.rotation.y = Math.random() * Math.PI;

        let c6 = new THREE.Mesh(new THREE.CylinderGeometry(0, 7, 8, 10, 2, true));
        c6.position.y = 22.5;
        c6.rotation.y = Math.random() * Math.PI;

        let c7 = new THREE.Mesh(new THREE.CylinderGeometry(0, 5, 9, 10, 2, true));
        c7.position.y = 26;
        c7.rotation.y = Math.random() * Math.PI;

        let g = new THREE.Geometry();

        c0.updateMatrix();
        c1.updateMatrix();
        c2.updateMatrix();
        c3.updateMatrix();
        c4.updateMatrix();
        c5.updateMatrix();
        c6.updateMatrix();
        c7.updateMatrix();

        g.merge(c0.geometry, c0.matrix);
        g.merge(c1.geometry, c1.matrix);
        g.merge(c2.geometry, c2.matrix);
        g.merge(c3.geometry, c3.matrix);
        g.merge(c4.geometry, c4.matrix);
        g.merge(c5.geometry, c5.matrix);
        g.merge(c6.geometry, c6.matrix);
        g.merge(c7.geometry, c7.matrix);

        let b = c0.geometry.faces.length;

        for (let i = 0, l = g.faces.length; i < l; i++) {
            g.faces[i].materialIndex = i < b ? 0 : 1;
        }

        g.computeFaceNormals();
        g.computeVertexNormals();

        let m = new THREE.Mesh(g, material);

        return m;
    }
}