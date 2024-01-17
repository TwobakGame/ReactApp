import { Bodies, Body, Collision, Engine, Events, Render, Runner, World, Composite } from "matter-js";
import { FRUITS_BASE as FRUITS } from "./fruits";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Point from "./Point";

const iceConfig = Object.freeze({
    iceServers: [
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302',
            ]
        }
    ]
});

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let myTurnJs = false;
let interval = null;
let socket = null;
const pc = new RTCPeerConnection({
    iceServers: [
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302',
            ]
        }
    ]
});

let dataChannel = pc.createDataChannel("channel");
function GameClient(props) {

    const [engine, setEngine] = useState(Engine.create());
    const [render, setRender] = useState(Render.create({
        engine,
        element: document.body,
        options: {
            wireframes: false,
            background: "#F7F4C8",
            width: 620,
            height: 850,
        }
    }
    ));
    const [world, setWorld] = useState(engine.world);
    const roomNumber = props.roomnumber;
    const pointRef = useRef();

    const changePoint = (idx) => {
        pointRef.current.handlePoint(idx);
    };

    useEffect(() => {
        initSocket();

        const handleKeyDown = (event) => {
            if (disableAction || !myTurnJs) {
                return;
            }

            switch (event.code) {
                case "KeyA":
                    if (interval) return;
                    interval = setInterval(() => {
                        if (currentBody.position.x - currentFruit.radius > 30) {
                            sendEvent(event.code);
                            Body.setPosition(currentBody, {
                                x: currentBody.position.x - 1,
                                y: currentBody.position.y,
                            });
                        }
                    }, 5);

                    break;
                case "KeyD":
                    if (interval) return;
                    interval = setInterval(() => {
                        if (currentBody.position.x - currentFruit.radius < 510) {
                            sendEvent(event.code);
                            Body.setPosition(currentBody, {
                                x: currentBody.position.x + 1,
                                y: currentBody.position.y,
                            });
                        }
                    }, 5);

                    break;
                case "KeyS":
                    sendEvent("done");
                    clearInterval(interval);
                    sendEvent(event.code);
                    currentBody.isSleeping = false;
                    disableAction = true;
                    myTurnJs = !myTurnJs;
                    setTimeout(() => {
                        disableAction = false;
                    }, 1000);
                    break;
            }
        };

        const handleKeyUp = (event) => {
            switch (event.code) {
                case "KeyA":
                case "KeyD":
                    if (myTurnJs) {
                        sendEvent("done");
                        clearInterval(interval);
                        interval = null;
                    }
            }
        };
      
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("keydown", handleKeyDown);

        Events.on(engine, "collisionStart", (event) => {
            event.pairs.forEach((collision) => {
                if (collision.bodyA.index === collision.bodyB.index) {
                    const index = collision.bodyA.index;
                    World.remove(world, [collision.bodyA, collision.bodyB]);
                    if (index === FRUITS.length - 1) {
                        return;
                    }
                    const newFruit = FRUITS[index + 1];
                    const newBody = Bodies.circle(
                        collision.collision.supports[0].x,
                        collision.collision.supports[0].y,
                        newFruit.radius,
                        {
                            render: {
                                sprite: { texture: `${newFruit.name}.png` }
                            },
                            index: index + 1,
                        }
                    );

                    World.add(world, newBody);
                }
            })
        });

        const leftWall = Bodies.rectangle(15, 395, 30, 790, {
            isStatic: true,
            render: { fillStyle: "#E6B143" }
        });

        const rightWall = Bodies.rectangle(605, 395, 30, 790, {
            isStatic: true,
            render: { fillStyle: "#E6B143" }
        });

        const ground = Bodies.rectangle(310, 820, 620, 60, {
            isStatic: true,
            render: { fillStyle: "#E6B143" }
        });

        const tobLine = Bodies.rectangle(310, 150, 620, 2, {
            name: "topLine",
            isStatic: true,
            isSensor: true,
            render: { fillStyle: "#E6B143" }
        });

        World.add(world, [leftWall, rightWall, ground, tobLine]);

        const renderElement = render.canvas;
        renderElement.style.marginLeft = "auto";
        renderElement.style.marginRight = "auto";
        renderElement.style.display = "block";

        Render.run(render);
        Runner.run(engine);

        return () => {
            World.clear(world, true);

            Render.stop(render);
            Runner.stop(engine);

            if (render.canvas) {
                render.canvas.remove();
            }

            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        }

    }, []);

    const initSocket = async () => {
        socket = io("http://localhost:443");

        socket.on('answer', (answer) => {
            console.log("answer 받음");
            pc.setRemoteDescription(answer);
        });
        socket.on('ice', (ice) => {
            pc.addIceCandidate(ice);
        });

        if (socket) {
            socket.emit('join', roomNumber);
            pc.addEventListener("icecandidate", handleIce);
            pc.ondatachannel = event => {
                var channel = event.channel;
                channel.onopen = () => console.log("데이터 채널 오픈");
                channel.onmessage = e => { recieveEvent(e) };
            }
            const offer = await pc.createOffer();
            pc.setLocalDescription(offer);
            socket.emit('offer', offer);
            console.log("offer 보냄");
        }
    }

    function handleIce(data) {
        socket.emit("ice", data.candidate);
        console.log("sent my candidate");
    }

    function addFruit(index) {
        if (index == -1) {
            index = Math.floor(Math.random() * 5);
            sendEvent("addFruit", index);
        }
        const fruit = FRUITS[index];

        const body = Bodies.circle(300, 50, fruit.radius, {
            index: index,
            isSleeping: true, //대기상태
            render: {
                sprite: { texture: `${fruit.name}.png` }
            },
            restitution: 0.5, //탄성
        });

        currentBody = body;
        currentFruit = fruit;

        World.add(world, body);
    }

    function gameOver() {
        alert("Game Over!");
        World.clear(world, true);
        pointRef.current.resetPoint();
    }

    function sendEvent(eventCode, indexNum) {
        if (dataChannel.readyState === "open") {
            dataChannel.send(JSON.stringify({ event: eventCode, index: indexNum }));
        }
    }

    function recieveEvent(event) {
        const data = JSON.parse(event.data);
        console.log(data);
        switch (data.event) {
            case "KeyA":
                if (interval) return;
                interval = setInterval(() => {
                    if (currentBody.position.x - currentFruit.radius > 30) {
                        Body.setPosition(currentBody, {
                            x: currentBody.position.x - 1,
                            y: currentBody.position.y,
                        });
                    }
                }, 5);
                break;

            case "KeyD":
                if (interval) return;
                interval = setInterval(() => {
                    if (currentBody.position.x - currentFruit.radius < 510) {
                        Body.setPosition(currentBody, {
                            x: currentBody.position.x + 1,
                            y: currentBody.position.y,
                        });
                    }
                }, 5);
                break;

            case "KeyS":
                currentBody.isSleeping = false;
                disableAction = true;
                myTurnJs = !myTurnJs;

                setTimeout(() => {
                    disableAction = false;
                    addFruit(-1);
                }, 1200);
                break;
            case "done":
                clearInterval(interval);
                interval = null;
                break;
            case "addFruit":
                addFruit(data.index);
                break;
            case "world":
                console.log(data.bodies);
                World.clear(world, true);

                for (let now of data.bodies) {
                    const fruit = FRUITS[now.index];

                    const body = Bodies.circle(now.x, now.y, fruit.radius, {
                        index: now.index,
                        angle: now.angle,
                        isSleeping: false, //대기상태
                        render: {
                            sprite: { texture: `${fruit.name}.png` }
                        },
                        restitution: 0.5, //탄성
                        velocity: now.velocity,
                    });

                    World.add(world, body);
                }

                break;
            case "point":
                pointRef.current.handlePoint(data.index);
                break;
            case "GameOver":
                alert("Game Over!");
                gameOver();
        }
    }


    return (
        <>
            <h1>제목</h1>
            <Point ref={pointRef}/>
        </>
    );

}

export default GameClient;
