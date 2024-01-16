import { forwardRef, useImperativeHandle, useState } from "react";

const Point = forwardRef((props, ref) => {

    const [point, setPoint] = useState(0);

    useImperativeHandle(ref, () => ({
        handlePoint,
    }));

    const handlePoint = (idx) => {
        idx = idx + 1;
        setPoint(point + idx + idx*2);
    }

    return (
        <p>point : {point}</p>
    )
});

export default Point;