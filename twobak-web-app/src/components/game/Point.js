import { forwardRef, useImperativeHandle, useState } from "react";
import "../../css/point.css";

const Point = forwardRef((props, ref) => {

    const [point, setPoint] = useState(0);

    useImperativeHandle(ref, () => ({
        handlePoint,
        resetPoint
    }));

    const handlePoint = (idx) => {
        idx = idx + 1;
        setPoint(point + idx + idx * 2);
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