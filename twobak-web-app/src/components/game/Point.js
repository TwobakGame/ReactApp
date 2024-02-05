import { forwardRef, useImperativeHandle, useState } from "react";
import "../../css/point.css";
import { call } from "../../api/Api";

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
        alert(`Game Over!\n점수 : ${point}`);
        call("/users/savescore/", "POST", { score: `${point}` })
            .then((response) => {
                console.log(response);
            });
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