AFRAME.registerComponent('stairs-generator', {
        schema: {
    length: { type: 'number', default: 3 },
  },

        init: function () {
            const stairsContainer = this.el; 
            let y = 6;
            let z = 0;

            while (y >= 0.5) {
                const box = document.createElement('a-box');
                box.setAttribute('material', 'src: #concrete; roughness: 1; repeat: 0.25 0.25');
                box.setAttribute('position', `0 ${y-6} ${z}`);
                box.setAttribute('scale',  this.data.length + ' 0.5 1.5');
                box.setAttribute('static-body', '');

                stairsContainer.appendChild(box);

                y -= 0.5;
                z -= 1.5;
            }
        }
    });