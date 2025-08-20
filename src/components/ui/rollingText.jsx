import './rollingtext.css';

const RollingText = ({
    text1 = "This is rolling text!",
    text2 = "This is text 1",
    speed = 50,
    direction = "left", // new prop: "left" or "right"
    duplicates = 4 // optional: how many times to duplicate text for seamless loop
}) => {
    const duration = `${((text1.length + text2.length) / speed) + 10}s`;

    // generate repeated text spans
    const textItems = Array.from({ length: duplicates }).flatMap(() => [
        <span
            className="rolling-text-item font-bold text-[30px] md:text-5xl"
            style={{ fontFamily: 'var(--font-poppins)' }}
            key={Math.random()}
        >
            {text1}
        </span>,
        <span
            className="rolling-text-item text-stroke text-[30px] md:text-5xl"
            style={{ fontFamily: 'var(--font-poppins)' }}
            key={Math.random()}
        >
            {text2}
        </span>
    ]);

    return (
        <div className="rolling-text-container bg-amber-300">
            <div
                className={`rolling-text-track ${direction === "right" ? "scroll-right" : "scroll-left"}`}
                style={{ animationDuration: duration }}
            >
                {textItems}
            </div>
        </div>
    );
};

export default RollingText;
