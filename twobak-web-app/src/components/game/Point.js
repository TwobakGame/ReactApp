import { forwardRef, useImperativeHandle, useState } from "react";
import "../../css/point.css";
import { call, get_cookie } from "../../api/Api";

const Point = forwardRef((props, ref) => {

    const [point, setPoint] = useState(0);

    useImperativeHandle(ref, () => ({
        handlePoint,
        resetPoint,
        savePoint,
    }));

    const handlePoint = (idx) => {
        idx = idx + 1;
        setPoint(point + idx + idx * 2);
    }

    const savePoint = () => {
        const cookieString = document.cookie;

        const isTokenExists = cookieString.includes("Nickname");
        if(isTokenExists) {
            const nickname = get_cookie("Nickname");
            call("/users/savescore/", "POST", { user: nickname, score: `${point}` })
            .then((response) => {
                console.log(response);
            });
        }

        alert(`Game Over!\n점수 : ${point}`);

    }

    const resetPoint = () => {
        setPoint(0);
    }

    return (
        <div class="box1">
            score : {point}
        </div>
    )
});

export default Point;