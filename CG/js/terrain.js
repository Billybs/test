
    import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

    // Setup scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(100, 100, 100);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    function createSoilTexture() {
        let size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        const flowerColors = ['#ffffff', '#00ffff', '#ffff00', '#ab4bff']; //white cyan yellow lilac
    
        ctx.fillStyle = '#1e4e09'; //grass green
        ctx.fillRect(0, 0, size, size);
    
        for (let i = 0; i < 400; i++) {
            let x = Math.random() * size;
            let y = Math.random() * size; //low probability of repeated coordinates
            ctx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    // Load and generate terrain
    async function generateTerrain() {
      const loader = new THREE.TextureLoader();
      const texture = await loader.loadAsync('images/heightmap.png'); // Replace with your image path

      const image = texture.image;
      const width = image.width;
      const height = image.height;

      // Read pixel data using canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height).data;

      // Create a plane geometry
      const geometry = new THREE.PlaneGeometry(100, 100, width - 1, height - 1);
      geometry.rotateX(-Math.PI / 2); // Lay flat

      const vertices = geometry.attributes.position;
      for (let i = 0; i < vertices.count; i++) {
        const x = i % width;
        const y = Math.floor(i / width);
        const pixelIndex = (y * width + x) * 4;
        const grayscale = imageData[pixelIndex]; // R channel
        const heightValue = grayscale / 255 * 10; // Adjust this for bumpiness
        vertices.setY(i, heightValue);
      }

      vertices.needsUpdate = true;
      geometry.computeVertexNormals();

      // Green terrain material
      const soiltexture = createSoilTexture();
      soiltexture.needsUpdate = true;
      const material = new THREE.MeshLambertMaterial({ map: soiltexture, side: THREE.FrontSide }); // forest green
      const terrain = new THREE.Mesh(geometry, material);
      scene.add(terrain);
    }

    // Run
    generateTerrain();

    // Render loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();

    // Handle resizing
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });


