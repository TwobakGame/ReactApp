import { Bodies, Body, Collision, Engine, Events, Render, Runner, World, Composite } from "matter-js";
import { FRUITS_BASE as FRUITS } from "./fruits";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Point from "./Point";
import { Button } from "@mui/material";
import "../../css/game.css";
import { useLocation } from "react-router-dom";


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
let myTurnJs = true;
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

function GameManager(props) {

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
    const [start, setStart] = useState(true);

    const handleStart = () => {
        setStart(true);
    }

    const roomNumber = props.roomnumber;
    const pointRef = useRef();
    const location = useLocation();
    const nickName = location.state && location.state.nickName;

    const changePoint = (idx) => {
        pointRef.current.handlePoint(idx);
    };

    useEffect(() => {
        
        console.log("닉네임 : " , nickName)
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
                        sendWorld();
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
                    changePoint(index);
                    sendEvent('point', index);
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
                    sendWorld();
                    sendEvent("GameOver");
                    gameOver();
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

            if (pc) pc.close();
            if (socket) socket.close();
        }

    }, []);

    const initSocket = async () => {
        socket = io("http://localhost:443");

        socket.on('offer', async (offer) => {
            console.log("offer 받음");
            if (pc.signalingState === 'have-local-offer') {
                try {
                    await pc.setRemoteDescription(offer);
                    const answer = await pc.createAnswer();
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
            socket.emit('join', roomNumber);
            pc.addEventListener("icecandidate", handleIce);
            pc.addEventListener("connectionstatechange", (event) => {
                switch (pc.connectionState) {
                    case "connected":
                        console.log("상대와 연결됨");
                        setStart(false);
                        break;
                    case "disconnected":
                    case "closed":
                    case "failed":
                        alert("상대방과 연결이 끊겨 게임을 중단합니다.");
                        window.location.href = "/";
                        break;
                }
            })
            pc.ondatachannel = event => {
                var channel = event.channel;
                channel.onopen = () => console.log("데이터 채널 오픈");
                channel.onmessage = e => { recieveEvent(e) };
            }
            pc.setLocalDescription(await pc.createOffer());
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
        alert(`Game Over!\n점수 : ${pointRef}`);
        World.clear(world, true);
        //여기에 점수를 POST하는 메서드 필요
        pointRef.current.resetPoint();
        setStart(false);
    }

    function sendEvent(eventCode, indexNum) {
        if (dataChannel.readyState === "open") {
            dataChannel.send(JSON.stringify({ event: eventCode, index: indexNum }));
        }
    }

    function sendWorld() {
        if (dataChannel.readyState === "open") {
            let bodies = Composite.allBodies(world);

            let circleBodies = [];

            for (let body of bodies) {
                if (body.label === 'Circle Body') {
                    let index = body.index;
                    let x = body.position.x;
                    let y = body.position.y;
                    let angle = body.angle;
                    let velocity = body.velocity;
                    circleBodies.push({ index: index, x: x, y: y, angle: angle, velocity });
                }
            }
            dataChannel.send(JSON.stringify({ event: 'world', bodies: circleBodies }));
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
                }, 1000);
                break;
            case "done":
                clearInterval(interval);
                interval = null;
                break;
            case "addFruit":
                addFruit(data.index);
                break;
        }
    }

    return (
        <div className="game-page">

            <Button variant="contained" className="start-button" disabled={start} onClick={() => { handleStart(); addFruit(-1); }}>시작하기</Button>
            <Point ref={pointRef} />

        </div>
    );

}

export default GameManager;
