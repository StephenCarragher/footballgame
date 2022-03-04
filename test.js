var KEY_CODE_ENTER = 13;
var KEY_CODE_LEFT_ARROW = 37;
var KEY_CODE_UP_ARROW = 38;
var KEY_CODE_RIGHT_ARROW = 39;
var KEY_CODE_DOWN_ARROW = 40;

var root;
var projectile = 0;
var upDownAngle = 0;//Math.PI/2;

var leftRightAngle = 0;
var Matrix;
var Transform;
// var velocityMetersPerSecond= 30;
var upDownMatrix;
var upDownTransform;
var leftRightMatrix;
var leftRightTransform;

var windspeed = -1.5;
var xloc;
var yloc;
var zloc;
var xspeed;
var yspeed;
var zspeed;
var highscore;
var score = 0;
var lives = 3;


function setrandwindspeed(){
 var rand=Math.floor((Math.random() * 20)-10 );
 var windelement = document.getElementById("wind");
 windelement.innerHTML = rand + " ";
 windspeed=rand*.15;

}

function scored() {
score+=1;
setScore();
setrandwindspeed();
if(score>highscore){
    highscore=score;
    setHighscore();
}

}
function missed() {
    lives-=1;
    setLives();
    setrandwindspeed();
if(lives<1){
    gameover();
}
 }

 function gameover() {
    projectile=10;
    root.addChild(createLightTransform(-5, -5, -5, createPointLight(1.0, 0.0, 0.0)));
    
    alert("game over. Refresh to play again")
 }


function getHighscore() {
    if (isNaN(localStorage.getItem('highscore'))) { highscore = 0; }
    else {
        highscore = localStorage.getItem('highscore');
    }
    setHighscore();
}


function setHighscore() {
    var highscoreelement = document.getElementById("highscore");
    highscoreelement.innerHTML = highscore + " ";
    localStorage.setItem('highscore',highscore);
}
function setScore() {
    var scoreelement = document.getElementById("score");
    scoreelement.innerHTML = score + " ";
}
function setLives() {
    var liveselement = document.getElementById("lives");
    liveselement.innerHTML = lives + " ";
}

function keyPressed(event) {
    console.log("x speed " + xspeed)
    if (projectile == 0) {
        var keyCode = event.keyCode;
        var angleIncrement = 0.05;

        if (upDownAngle < -1.5) upDownAngle += angleIncrement;
        if (upDownAngle > 0) upDownAngle -= angleIncrement;
        if (leftRightAngle < -1.5) leftRightAngle += angleIncrement;
        if (leftRightAngle > 1.5) leftRightAngle -= angleIncrement;


        if (keyCode == KEY_CODE_DOWN_ARROW)
            upDownAngle -= angleIncrement;
        else if (keyCode == KEY_CODE_UP_ARROW)
            upDownAngle += angleIncrement;
        else if (keyCode == KEY_CODE_LEFT_ARROW)
            leftRightAngle += angleIncrement;
        else if (keyCode == KEY_CODE_RIGHT_ARROW)
            leftRightAngle -= angleIncrement;
        else if (keyCode == KEY_CODE_ENTER) {
            if (projectile != 1) createProjectile();
        }

        // console.log("up down " + upDownAngle);
        // console.log("left right " + leftRightAngle);
        if (upDownAngle > -1.5 && upDownAngle < 0) {
            osg.Matrix.makeRotate(upDownAngle, -1.0, 0.0, 0.0, upDownMatrix);
            upDownTransform.setMatrix(upDownMatrix);
        }

        osg.Matrix.makeRotate(leftRightAngle, 0.0, 0.0, 1.0, leftRightMatrix);
        leftRightTransform.setMatrix(leftRightMatrix);
    }
}

var SimpleUpdateCallback = function () { };

SimpleUpdateCallback.prototype = {

    distance: 0,
    startTimeSeconds: -1,
    velocityMetersPerSecond: 60,
    gravity: .7,


    update: function (node, nodeVisitor) {
        // console.log(upDownAngle)
        // console.log(leftRightAngle)

        var simulationTimeSeconds = nodeVisitor.getFrameStamp().getSimulationTime();
        if (this.startTimeSeconds == -1)
            this.startTimeSeconds = simulationTimeSeconds;

        var projectileTravelTimeSeconds = simulationTimeSeconds - this.startTimeSeconds;

        var distanceTravelledMeters = this.velocityMetersPerSecond * projectileTravelTimeSeconds;
        var distanceBlownMeters = this.wind * projectileTravelTimeSeconds;
        var distanceFallenMeters = -this.gravity * projectileTravelTimeSeconds;

        // console.log("z speed " +zspeed)
        // console.log("z location " +zloc)
        // console.log("y location " +yloc)
        // console.log("x location " +xloc)
        zspeed = Math.abs(this.velocityMetersPerSecond * Math.sin(upDownAngle));
        zloc = zspeed * (projectileTravelTimeSeconds - this.gravity * (projectileTravelTimeSeconds * projectileTravelTimeSeconds / 2));

        yspeed = Math.abs(this.velocityMetersPerSecond * Math.cos(leftRightAngle) * Math.cos(upDownAngle));
        yloc = yspeed * (projectileTravelTimeSeconds - 0 * (projectileTravelTimeSeconds * projectileTravelTimeSeconds / 2));

        xspeed = (-this.velocityMetersPerSecond * Math.sin(leftRightAngle) * Math.cos(upDownAngle)) -windspeed*2;
        if(xspeed<=0)
        {xloc = xspeed * (projectileTravelTimeSeconds +windspeed * (projectileTravelTimeSeconds * projectileTravelTimeSeconds / 2));
        }else
        {xloc = xspeed * (projectileTravelTimeSeconds -windspeed * (projectileTravelTimeSeconds * projectileTravelTimeSeconds / 2));
        }
        // zloc=zloc+zspeed* projectileTravelTimeSeconds;
        // console.log("distance travelled " + distanceTravelledMeters)
        // console.log("distance blown " + distanceBlownMeters)
        // console.log("distance fallen " + distanceFallenMeters)

        var matrix = node.getMatrix();
        // osg.Matrix.makeTranslate( distanceBlownMeters, distanceTravelledMeters, distanceFallenMeters, matrix);
        osg.Matrix.makeTranslate(xloc, yloc, zloc, matrix);
        // this.wind=this.wind+this.windspeed;
        // this.gravity=this.gravity+.01;

        if (yloc > 100) {
            if (zloc > 7 && xloc < 5 && xloc > -5) {
                // alert("you scored");
                scored();
                console.log("you scored")
                console.log("destroying ball")
                node.removeUpdateCallback(this);
                node.getParents()[0].removeChild(node);
                projectile -= 1;
            }
            else {
                // alert("you missed");
                console.log("you missed")
                console.log("destroying ball")
                missed();
                node.removeUpdateCallback(this);
                node.getParents()[0].removeChild(node);
                projectile -= 1;
            }
            // distanceBlownMeters=301;

        }

        if (distanceTravelledMeters > 300) {
            console.log("destroying ball")
            missed();
            node.removeUpdateCallback(this);
            node.getParents()[0].removeChild(node);
            projectile -= 1;
        }

        return true;
    }
};

function createProjectile() {

    xloc = 0;
    zloc = 0;
    yloc = 0;
    projectile = 1;
    // xspeed=0;
    // yspeed=0;
    // zspeed=Math.abs(velocityMetersPerSecond*Math.sin(upDownAngle));
    console.log("up down " + upDownAngle)
    console.log("left right  " + leftRightAngle)

    var sphere = osg.createTexturedSphere(0.4);
    var material = new osg.Material();
    material.setAmbient([0.2, 0.2, 0.2, 1.0]);
    material.setDiffuse([1.0, 0.0, 0.0, 1.0]);
    material.setSpecular([1.0, 1.0, 1.0, 1.0]);
    material.setEmission([0.0, 0.0, 0.0, 1.0]);
    material.setShininess(128);
    sphere.getOrCreateStateSet().setAttributeAndMode(material);

    var projectileDistanceMatrix = new osg.Matrix.create();
    osg.Matrix.makeTranslate(0, 0, 0, projectileDistanceMatrix);
    var projectileDistanceTransform = new osg.MatrixTransform();
    projectileDistanceTransform.setMatrix(projectileDistanceMatrix);
    projectileDistanceTransform.addChild(sphere);
    root.addChild(projectileDistanceTransform);

    var updateCallback = new SimpleUpdateCallback();
    projectileDistanceTransform.addUpdateCallback(updateCallback);

    // var projectileUpDownMatrix = new osg.Matrix.create();
    // osg.Matrix.makeRotate(upDownAngle, -1.0, 0.0, 0.0, projectileUpDownMatrix);
    // var projectileUpDownTransform = new osg.MatrixTransform();
    // projectileUpDownTransform.setMatrix(projectileUpDownMatrix);
    // projectileUpDownTransform.addChild(projectileDistanceTransform);

    // var projectileLeftRightMatrix = new osg.Matrix.create();
    // osg.Matrix.makeRotate(leftRightAngle, 0.0, 0.0, 1.0, projectileLeftRightMatrix);
    // var projectileLeftRightTransform = new osg.MatrixTransform();
    // projectileLeftRightTransform.setMatrix(projectileLeftRightMatrix);
    // projectileLeftRightTransform.addChild(projectileUpDownTransform);

    // root.addChild(projectileLeftRightTransform);
}

function createAmbientLight(r, g, b) {

    var lightNumber = getNextLightNumber();
    var ambientLight = new osg.Light(lightNumber);
    //ambientLight.setPosition([0, 0, 0, 1]);

    if (typeof r === 'undefined') r = 0.8;
    if (typeof g === 'undefined') g = 0.8;
    if (typeof b === 'undefined') b = 0.8;
    ambientLight.setDiffuse([0.0, 0.0, 0.0, 1.0]);
    ambientLight.setSpecular([0.0, 0.0, 0.0, 1.0]);
    ambientLight.setAmbient([r, g, b, 1.0]);

    var lightSource = new osg.LightSource();
    lightSource.setLight(ambientLight);
    return lightSource;
}


function createDirectionalLight(x, y, z, r, g, b) {

    var lightNumber = getNextLightNumber();
    var directionalLight = new osg.Light(lightNumber);

    if (typeof x === 'undefined') x = 1.0;
    if (typeof y === 'undefined') y = -1.0;
    if (typeof z === 'undefined') z = 1.0;
    directionalLight.setPosition([x, y, z, 0.0]);

    if (typeof r === 'undefined') r = 0.8;
    if (typeof g === 'undefined') g = 0.8;
    if (typeof b === 'undefined') b = 0.8;
    directionalLight.setDiffuse([r, g, b, 1.0]);
    directionalLight.setSpecular([r, g, b, 1.0]);
    directionalLight.setAmbient([0.0, 0.0, 0.0, 1.0]);

    var lightSource = new osg.LightSource();
    lightSource.setLight(directionalLight);
    return lightSource;
}

function createLightTransform(x, y, z, light) {
    var lightMatrix = new osg.Matrix.create();
    lightMatrix = osg.Matrix.makeTranslate(x, y, z, lightMatrix);
    var lightMatrixTransform = new osg.MatrixTransform();
    lightMatrixTransform.setMatrix(lightMatrix);

    lightMatrixTransform.addChild(light);
    return lightMatrixTransform;
}

function createPointLight(r, g, b, c, l, q) {

    var lightNumber = getNextLightNumber();
    var pointLight = new osg.Light(lightNumber);
    pointLight.setPosition([0, 0, 0, 1]);

    if (typeof r === 'undefined') r = 0.8;
    if (typeof g === 'undefined') g = 0.8;
    if (typeof b === 'undefined') b = 0.8;
    pointLight.setDiffuse([r, g, b, 1.0]);
    pointLight.setSpecular([r, g, b, 1.0]);
    pointLight.setAmbient([0.0, 0.0, 0.0, 1.0]);

    if (typeof c === 'undefined') c = 1.0;
    if (typeof l === 'undefined') l = 0.0;
    if (typeof q === 'undefined') q = 0.0;
    pointLight.setConstantAttenuation(c);
    pointLight.setLinearAttenuation(l);
    pointLight.setQuadraticAttenuation(q);

    var lightSource = new osg.LightSource();
    lightSource.setLight(pointLight);

    return lightSource;
}



function createLamp(x, y, r, g, b) {

    var localRoot = new osg.Node();

    var defaultMaterial = new osg.Material();
    defaultMaterial.setDiffuse([0.5, 0.5, 0.5, 1.0]);

    var emissiveMaterial = new osg.Material();
    emissiveMaterial.setEmission([r, g, b, 1.0]);

    var baseRadiusMeters = 2;
    var base = createSolidCylinderWithNormalsAndTextureCoordinates(baseRadiusMeters, 1, 20);
    base.getOrCreateStateSet().setAttributeAndModes(defaultMaterial);
    var baseMatrix = new osg.Matrix.create();
    baseMatrix = osg.Matrix.makeTranslate(x, y, 0.0, baseMatrix);
    var baseMatrixTransform = new osg.MatrixTransform();
    baseMatrixTransform.setMatrix(baseMatrix);
    baseMatrixTransform.addChild(base);
    localRoot.addChild(baseMatrixTransform);

    var column = createSolidCylinderWithNormalsAndTextureCoordinates(1, 30, 20);
    var columnMatrix = new osg.Matrix.create();
    columnMatrix = osg.Matrix.makeTranslate(x, y, 0.5, columnMatrix);
    var columnMatrixTransform = new osg.MatrixTransform();
    columnMatrixTransform.setMatrix(columnMatrix);
    columnMatrixTransform.addChild(column);
    localRoot.addChild(columnMatrixTransform);

    var light = createPointLight(r, g, b, 0.0, 0.0, 0.0);
    light.getLight().setEnabled(false);

    var bulb = osg.createTexturedSphere(3, 20, 20);

    bulb.getOrCreateStateSet().setAttributeAndModes(emissiveMaterial);
    var bulbMatrix = new osg.Matrix.create();
    bulbMatrix = osg.Matrix.makeTranslate(x, y, 15, bulbMatrix);
    var bulbMatrixTransform = new osg.MatrixTransform();

    bulbMatrixTransform.setMatrix(bulbMatrix);
    bulbMatrixTransform.addChild(light);
    bulbMatrixTransform.addChild(bulb);



    localRoot.addChild(bulbMatrixTransform);
    return localRoot;
}

var nextLightNumber = 1;
function getNextLightNumber() {
    return nextLightNumber++;
}

function createPointLight(r, g, b, c, l, q) {

    var lightNumber = getNextLightNumber();
    var pointLight = new osg.Light(lightNumber);
    pointLight.setPosition([0, 0, 0, 1]);

    if (typeof r === 'undefined') r = 0.8;
    if (typeof g === 'undefined') g = 0.8;
    if (typeof b === 'undefined') b = 0.8;
    pointLight.setDiffuse([r, g, b, 1.0]);
    pointLight.setSpecular([r, g, b, 1.0]);
    pointLight.setAmbient([0.0, 0.0, 0.0, 1.0]);

    if (typeof c === 'undefined') c = .01;
    if (typeof l === 'undefined') l = 0.0;
    if (typeof q === 'undefined') q = 0.0;
    pointLight.setConstantAttenuation(c);
    pointLight.setLinearAttenuation(l);
    pointLight.setQuadraticAttenuation(q);

    var lightSource = new osg.LightSource();
    lightSource.setLight(pointLight);

    return lightSource;
}












function createSolidCylinderWithNormalsAndTextureCoordinates(radius, height, faces) {

    var angle = 0;
    var angleIncrement = (2 * Math.PI) / faces;
    var coordinates = new Array();
    var normals = new Array();
    var texCoords = new Array();

    var x0 = radius * Math.cos(angle);
    var y0 = radius * Math.sin(angle);
    var nx0 = Math.cos(angle);
    var ny0 = Math.sin(angle);
    var cosAngle0 = Math.cos(angle);
    var sineAngle0 = Math.sin(angle);
    var s0 = 0;
    var z = height / 2;

    for (var f = 0; f < faces; f++) {

        angle += angleIncrement;
        var cosAngle1 = Math.cos(angle);
        var sinAngle1 = Math.sin(angle);

        /* Coordinates */ {

            var x1 = radius * Math.cos(angle);
            var y1 = radius * Math.sin(angle);

            coordinates.push(0, 0, z);
            coordinates.push(x0, y0, z);
            coordinates.push(x1, y1, z);

            coordinates.push(x0, y0, -z);
            coordinates.push(x1, y1, z);
            coordinates.push(x0, y0, z);

            coordinates.push(x0, y0, -z);
            coordinates.push(x1, y1, -z);
            coordinates.push(x1, y1, z);

            coordinates.push(x1, y1, -z);
            coordinates.push(x0, y0, -z);
            coordinates.push(0, 0, -z);

            x0 = x1;
            y0 = y1;
        }
        var nx1 = Math.cos(angle);
        var ny1 = Math.sin(angle);

        /* Normals */ {
            normals.push(0, 0, 1);
            normals.push(0, 0, 1);
            normals.push(0, 0, 1);

            normals.push(nx0, ny0, 0);
            normals.push(nx1, ny1, 0);
            normals.push(nx0, ny0, 0);

            normals.push(nx0, ny0, 0);
            normals.push(nx1, ny1, 0);
            normals.push(nx1, ny1, 0);

            normals.push(0, 0, -1);
            normals.push(0, 0, -1);
            normals.push(0, 0, -1);
        }

        /* Texture coordinates */ {

            var s1 = angle / (2 * Math.PI);

            texCoords.push(0.5, 0.5);
            texCoords.push(0.5 + 0.5 * nx0, 0.5 + 0.5 * ny0);
            texCoords.push(0.5 + 0.5 * nx1, 0.5 + 0.5 * ny1);

            texCoords.push(s0, 0.0);
            texCoords.push(s1, 1.0);
            texCoords.push(s0, 1.0);

            texCoords.push(s0, 0.0);
            texCoords.push(s1, 0.0);
            texCoords.push(s1, 1.0);

            texCoords.push(0.5 + 0.5 * nx1, 0.5 - 0.5 * ny1);
            texCoords.push(0.5 + 0.5 * nx0, 0.5 - 0.5 * ny0);
            texCoords.push(0.5, 0.5);

            s0 = s1;
        }

        nx0 = nx1;
        ny0 = ny1;
    }

    var geometry = new osg.Geometry();

    var vertexCoordAttribArray = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null, 3);
    vertexCoordAttribArray.setElements(new Float32Array(coordinates));
    geometry.setVertexAttribArray('Vertex', vertexCoordAttribArray);

    var textureAttribArray = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null, 2);
    textureAttribArray.setElements(new Float32Array(texCoords));
    geometry.setVertexAttribArray('TexCoord0', textureAttribArray);

    var normalAttribArray = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, null, 3);
    normalAttribArray.setElements(new Float32Array(normals));
    geometry.setVertexAttribArray('Normal', normalAttribArray);

    geometry.getPrimitives().push(new osg.DrawArrays(osg.PrimitiveSet.TRIANGLES, 0, 6 * faces + 3 * faces + 3 * faces));

    return geometry;
}