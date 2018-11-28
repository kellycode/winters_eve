function buildTree(treeTexture) {

    var treeMaterial;

    if (treeTexture) {
        const H_REP = 2;
        const W_REP = 8;

        treeTexture.wrapS = THREE.RepeatWrapping;
        treeTexture.wrapT = THREE.RepeatWrapping;
        treeTexture.repeat.set(W_REP, H_REP);
        
        treeMaterial = new THREE.MeshLambertMaterial({map: treeTexture})
    } else {
        treeMaterial = new THREE.MeshLambertMaterial({color: 0x2d4c1e})
    }

    var material = [
        new THREE.MeshLambertMaterial({color: 0x3d2817}), // brown
        treeMaterial // green
    ];

    var c0 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6, 1, true));
    c0.position.y = 6;
    var c1 = new THREE.Mesh(new THREE.CylinderGeometry(0, 10, 14, 8));
    c1.position.y = 18;
    var c2 = new THREE.Mesh(new THREE.CylinderGeometry(0, 9, 13, 8));
    c2.position.y = 25;
    var c3 = new THREE.Mesh(new THREE.CylinderGeometry(0, 8, 12, 8));
    c3.position.y = 32;

    var g = new THREE.Geometry();
    c0.updateMatrix();
    c1.updateMatrix();
    c2.updateMatrix();
    c3.updateMatrix();
    g.merge(c0.geometry, c0.matrix);
    g.merge(c1.geometry, c1.matrix);
    g.merge(c2.geometry, c2.matrix);
    g.merge(c3.geometry, c3.matrix);

    var b = c0.geometry.faces.length;
    for (var i = 0, l = g.faces.length; i < l; i++) {
        g.faces[i].materialIndex = i < b ? 0 : 1;
    }

    var m = new THREE.Mesh(g, material);

    m.scale.y = m.scale.x = m.scale.z = 10;

    return m;
}