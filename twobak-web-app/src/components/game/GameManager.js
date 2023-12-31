import { Bodies, Body, Collision, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS_BASE as FRUITS } from "./fruits";
import { useEffect, useState } from "react";
import io from "socket.io-client";

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

let dataChannel = pc.createDataChannel("chat");

function GameManager() {

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

    useEffect(() => {
        initSocket();

        window.onkeydown = (event) => {
            if (disableAction) {
                return;
            }
            switch (event.code) {
                case "KeyA":
                    if (interval) return;
                    interval = setInterval(() => {
                        if (currentBody.position.x - currentFruit.radius > 30)
                            Body.setPosition(currentBody, {
                                x: currentBody.position.x - 1,
                                y: currentBody.position.y,
                            });
                    }, 5);

                    break;
                case "KeyD":
                    if (interval) return;
                    interval = setInterval(() => {
                        if (currentBody.position.x - currentFruit.radius < 510)
                            Body.setPosition(currentBody, {
                                x: currentBody.position.x + 1,
                                y: currentBody.position.y,
                            });
                    }, 5);

                    break;
                case "KeyS":
                    currentBody.isSleeping = false;
                    disableAction = true;
                    setTimeout(() => {
                        addFruit();
                        disableAction = false;
                    }, 1000);
                    break;
            }
        }

        window.onkeyup = (event) => {
            switch (event.code) {
                case "KeyA":
                case "KeyD":
                    clearInterval(interval);
                    interval = null;
            }
        }

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

                if (!disableAction && (collision.bodyA.name === "topLine" || collision.bodyB.name === "tobLine")) {
                    alert("Game Over!");
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

        Render.run(render);
        Runner.run(engine);

        addFruit();

    }, []);

    const initSocket = async () => {
        socket = io("http://localhost:443");

        socket.on('offer', async(offer) => {
            console.log("offer 받음");
            if(pc.signalingState === 'have-local-offer') {
                try {
                    await pc.setRemoteDescription(offer);
                    const answer =  await pc.createAnswer();
                    pc.setLocalDescription(answer);
                    socket.emit("answer", answer);
                } catch (error) {
                    console.log('SDP 파싱 오류', error);
                } 
            }
            else {
                console.log("have-local-offer 상태가 아님");
            }

        });
        socket.on('ice', (ice) => {
            pc.addIceCandidate(ice);
        });

        if (socket) {
            await socket.emit('join', 123);
            pc.addEventListener("icecandidate", handleIce);
            pc.ondatachannel = event => {
                var channel = event.channel;
                channel.onopen = () => console.log("데이터 채널 오픈");
                channel.onmessage = e => console.log("메시지받음", e.data);
            }
            pc.setLocalDescription(await pc.createOffer());
        }
    }

    function handleIce(data) {
        socket.emit("ice", data.candidate);
        console.log("sent my candidate");
    }

    function addFruit() {
        console.log("addFruit");
        const index = Math.floor(Math.random() * 5);
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

    return (
        <>
            <h1>제목</h1>
        </>
    );

}

export default GameManager;
