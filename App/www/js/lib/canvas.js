class Canvas {
    constructor() {
        this.scoreThreshold = 0.2;
        this.radius = 2;
        this.line_width = 2;
    }

    setup(canvas, image){
        image.style.display = 'none'
        canvas.style.display = 'block';
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
    }

    async estimate(canvas, image, url, loadPose) {
        this.ctx.drawImage(image, 0, 0, 262, 197);
        loadPose(url);
        let detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER});
        let poses = await detector.estimatePoses(image);
        for (const pose of poses) {
            this.drawResult(pose);
        }
        loadPose(url);
    }


    drawResult(pose) {
        this.drawKeypoints(pose.keypoints);
        this.drawSkeleton(pose.keypoints);
    }

    drawKeypoints(keypoints) {
        const keypointInd = poseDetection.util.getKeypointIndexBySide('MoveNet');
        this.ctx.fillStyle = 'Red';
        this.ctx.strokeStyle = 'White';
        this.ctx.lineWidth = this.line_width;

        for (const i of keypointInd.middle) {
            this.drawKeypoint(keypoints[i]);
        }

        this.ctx.fillStyle = 'Green';
        for (const i of keypointInd.left) {
            this.drawKeypoint(keypoints[i]);
        }

        this.ctx.fillStyle = 'Orange';
        for (const i of keypointInd.right) {
            this.drawKeypoint(keypoints[i]);
        }
    }

    drawKeypoint(keypoint) {
        // If score is null, just show the keypoint.
        const score = keypoint.score != null ? keypoint.score : 1;

        if (score >= this.scoreThreshold) {
            const circle = new Path2D();
            circle.arc(keypoint.x, keypoint.y, this.radius, 0, 2 * Math.PI);
            this.ctx.fill(circle);
            this.ctx.stroke(circle);
        }
    }

    drawSkeleton(keypoints) {
        this.ctx.fillStyle = 'White';
        this.ctx.strokeStyle = 'White';
        this.ctx.lineWidth = this.line_width;

        poseDetection.util.getAdjacentPairs('MoveNet').forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];

            // If score is null, just show the keypoint.
            const score1 = kp1.score != null ? kp1.score : 1;
            const score2 = kp2.score != null ? kp2.score : 1;

            if (score1 >= this.scoreThreshold && score2 >= this.scoreThreshold) {
                this.ctx.beginPath();
                this.ctx.moveTo(kp1.x, kp1.y);
                this.ctx.lineTo(kp2.x, kp2.y);
                this.ctx.stroke();
            }
        });
    }
}