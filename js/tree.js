function buildTree(treeTexture) {

    var treeMaterial;

    if (treeTexture) {
        const H_REP = 2;
        const W_REP = 8;
        treeTexture.wrapS = THREE.RepeatWrapping;
        treeTexture.wrapT = THREE.RepeatWrapping;
        treeTexture.repeat.set(W_REP, H_REP);
        treeMaterial = new THREE.MeshLambertMaterial({map: treeTexture});
    } else {
        treeMaterial = new THREE.MeshLambertMaterial({color: 0x2d4c1e})
    }

    var material = [
        new THREE.MeshLambertMaterial({color: 0x3d2817}), // brown
        treeMaterial // green
    ];

    // radiusTop, radiusBottom, height, radialSegments
    var c0 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6, 1, true));
    c0.position.y = 6;

    var c1g = new THREE.CylinderGeometry(0, 14, 10, 10);
    var c1 = new THREE.Mesh(c1g);
    c1.position.y = 10;

    var c2 = new THREE.Mesh(new THREE.CylinderGeometry(0, 12, 10, 11));
    c2.position.y = 13;

    var c3 = new THREE.Mesh(new THREE.CylinderGeometry(0, 10, 10, 10));
    c3.position.y = 16;

    var c4 = new THREE.Mesh(new THREE.CylinderGeometry(0, 9, 8, 11));
    c4.position.y = 17.5;

    var c5 = new THREE.Mesh(new THREE.CylinderGeometry(0, 8, 8, 10));
    c5.position.y = 20;

    var c6 = new THREE.Mesh(new THREE.CylinderGeometry(0, 7, 8, 10));
    c6.position.y = 22.5;

    var c7 = new THREE.Mesh(new THREE.CylinderGeometry(0, 6, 9, 10));
    c7.position.y = 26;

    var g = new THREE.Geometry();

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

    var b = c0.geometry.faces.length;

    for (var i = 0, l = g.faces.length; i < l; i++) {
        g.faces[i].materialIndex = i < b ? 0 : 1;
    }
    
    g.computeFaceNormals();
    g.computeVertexNormals();

    var m = new THREE.Mesh(g, material);

    return m;
}