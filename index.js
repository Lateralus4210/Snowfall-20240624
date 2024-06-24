document.addEventListener("DOMContentLoaded", function() {

    // Configuration variables
    let color = "#ffffff";
    let numberOfCircles = 1; // Number of circles to draw each time
    let radius = 7; // Radius of the circle
    let angularSpeed = 0.01; // Speed of angular movement
    let linearSpeed = 1;
    let interval = 1000; // Interval in milliseconds to call drawShapes
    let numberOfSpirals = 4; // Number of spirals to draw
    let collideKill = false; // Collide kill flag
    let isPaused = false; // Pause flag
    let mandala = false;

    // Variables to hold canvas context and circles arrays
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    let spirals = [];
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    let maxDistance = Math.sqrt(Math.pow(canvasWidth / 2, 2) + Math.pow(canvasHeight / 2, 2));
    let intervalID;

    const controlPanel = document.getElementById('controlPanel');
    const hamburger = document.getElementById('hamburger');

        // Set up event listener for the hamburger button
    hamburger.addEventListener('click', function() {
        controlPanel.classList.toggle('hidden');
    });

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        maxDistance = Math.sqrt(Math.pow(canvasWidth / 2, 2) + Math.pow(canvasHeight / 2, 2));
        console.log(`Canvas resized to: ${canvasWidth}x${canvasHeight}`);
    }

    function drawShapes() {
        if (isPaused) return;

        for (let i = 0; i < numberOfCircles; i++) {
            let speed = (getRandomInt(1, 5) / getRandomInt(1, 3)) * linearSpeed; // Random speed for angular movement
            let angle = 0; // Starting angle
            let distance = 0; // Starting distance from center

            for (let j = 0; j < numberOfSpirals; j++) {
                let angleMultiplier = (j % 2 === 0) ? 1 : -1;
                let reflectX = (j >= 2 && j <= 3) || (j >= 6 && j <= 7);
                let reflectY = (j >= 4 && j <= 7);

                spirals.push({
                    x: canvasWidth / 2,
                    y: canvasHeight / 2,
                    radius: radius,
                    speed: speed,
                    angle: angle,
                    distance: distance,
                    angularSpeed: angularSpeed * angleMultiplier,
                    reflectX: reflectX,
                    reflectY: reflectY
                });
            }
        }
    }

    function checkCollision(circle1, circle2) {
        const dx = circle2.x - circle1.x;
        const dy = circle2.y - circle1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < circle1.radius + circle2.radius;
    }

    function updateAndDrawCircles() {
        if (isPaused) return;

        if (!mandala) {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear the canvas
        }

        function drawSpiral(circle) {
            // Update the circle's position
            circle.angle += circle.angularSpeed;
            circle.distance += circle.speed;

            let offsetX = circle.distance * Math.cos(circle.angle);
            let offsetY = circle.distance * Math.sin(circle.angle);

            if (circle.reflectX) {
                offsetX = -offsetX;
            }
            if (circle.reflectY) {
                offsetY = -offsetY;
            }

            circle.x = canvasWidth / 2 + offsetX;
            circle.y = canvasHeight / 2 + offsetY;

            // Calculate the color based on the distance from the center
            let fade = (circle.distance / maxDistance) * 255;
            fade = Math.min(Math.max(fade, 0), 255); // Clamp fade value between 0 and 255

            // let color = "white";

            // Draw the circle
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
        }

        // Check for collisions and mark circles for removal if collideKill is true
        if (collideKill) {
            let circlesToRemove = new Set();
            for (let i = 0; i < spirals.length; i++) {
                for (let j = i + 1; j < spirals.length; j++) {
                    if (checkCollision(spirals[i], spirals[j])) {
                        circlesToRemove.add(spirals[i]);
                        circlesToRemove.add(spirals[j]);
                        spirals = spirals.filter(circle => !circlesToRemove.has(circle));
                    }
                }
            }
        }

        spirals.forEach(circle => {
            drawSpiral(circle);
        });

        // Check for collisions with window
        spirals = spirals.filter(circle => 
            circle.x + radius >= 0 && 
            circle.x - radius <= canvasWidth && 
            circle.y + radius >= 0 && 
            circle.y - radius <= canvasHeight
        );
        

        requestAnimationFrame(updateAndDrawCircles); // Continue the animation loop
    }

    // Initial canvas size
    resizeCanvas();

    // Event listener for window resize
    window.addEventListener("resize", resizeCanvas);

    // Call drawShapes every interval
    intervalID = setInterval(drawShapes, interval);

    // Start the animation loop
    requestAnimationFrame(updateAndDrawCircles);

    // Update the UI values
    function updateUIValues() {
        document.getElementById('numberOfCirclesValue').textContent = numberOfCircles;
        document.getElementById('radiusValue').textContent = radius;
        document.getElementById('angularSpeedValue').textContent = angularSpeed.toFixed(3);
        document.getElementById('linearSpeedValue').textContent = linearSpeed;
        document.getElementById('intervalValue').textContent = interval;
        document.getElementById('numberOfSpiralsValue').textContent = numberOfSpirals;
        document.getElementById("controlPanel").height = canvas.height
    }

    function setEventListeners() {
        document.getElementById('colorPicker').addEventListener('input', function() {
            var selectedColor = this.value;
            
            // Set the value of a variable to the selected color
            color = selectedColor;
        });

        document.getElementById('numberOfCircles').addEventListener('input', function() {
            numberOfCircles = parseInt(this.value);
            updateUIValues();
        });

        document.getElementById('radius').addEventListener('input', function() {
            radius = parseInt(this.value);
            updateUIValues();
        });

        document.getElementById('angularSpeed').addEventListener('input', function() {
            angularSpeed = parseFloat(this.value);
            updateUIValues();
        });

        document.getElementById('linearSpeed').addEventListener('input', function() {
            linearSpeed = parseFloat(this.value);
            updateUIValues();
        });

        document.getElementById('interval').addEventListener('input', function() {
            interval = parseInt(this.value);
            updateUIValues();
        });

        document.getElementById('numberOfSpirals').addEventListener('input', function() {
            numberOfSpirals = parseInt(this.value);
            updateUIValues();
        });

        document.getElementById('reset').addEventListener('click', function() {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear the canvas
            clearInterval(intervalID);
            spirals = [];
            intervalID = setInterval(drawShapes, interval);
        });

        document.getElementById('pause').addEventListener('click', function() {
            isPaused = !isPaused;
            this.textContent = isPaused ? "Start" : "Pause";
            if (!isPaused) {
                requestAnimationFrame(updateAndDrawCircles);
            }
        });

        document.getElementById('collideKill').addEventListener('change', function() {
            collideKill = this.checked;
        });

        document.getElementById('mandala').addEventListener('change', function() {
            mandala = this.checked;
        });
    }
    setEventListeners()

    // Initialize UI values
    updateUIValues();
});
