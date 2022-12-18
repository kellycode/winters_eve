class Animator {

    constructor(THREE, model, animations, start_action) {
        this.previousAction = start_action;
        this.activeAction = start_action;

        this.mixer = new THREE.AnimationMixer(model);
        this.actions = {};

        for (let i = 0; i < animations.length; i++) {
            let clip = animations[ i ];
            let action = this.mixer.clipAction(clip);
            this.actions[ clip.name ] = action;
        }

        this.activeAction = this.actions[start_action];
        this.activeAction.play();
    }

    fadeToAction(name, duration) {
        this.previousAction = this.activeAction;
        this.activeAction = this.actions[ name ];

        if (this.previousAction !== this.activeAction) {
            this.previousAction.fadeOut(duration);
        }

        this.activeAction
                .reset()
                .setEffectiveTimeScale(1)
                .setEffectiveWeight(1)
                .fadeIn(duration)
                .play();
    }
}