const clouds = [
    { type: "white_1", top: "15%", speed: "animate-[cloudMove_50s_linear_infinite]" },
    { type: "white_4", top: "25%", speed: "animate-[cloudMove_42s_linear_infinite]" },
    { type: "white_2", top: "40%", speed: "animate-[cloudMove_35s_linear_infinite]" },
    { type: "white_3", top: "60%", speed: "animate-[cloudMove_25s_linear_infinite]" },
    { type: "white_3", top: "75%", speed: "animate-[cloudMove_50s_linear_infinite]" },
    { type: "white_4", top: "85%", speed: "animate-[cloudMove_42s_linear_infinite]" },
];

const LoginBackground = () => {
    return (
        <div className="absolute inset-0 z-1 overflow-hidden">
            {clouds.map((cloud, index) => (
                <div
                    key={index}
                    data-type={cloud.type}
                    className={`cloud ${cloud.speed}`}
                    style={{ top: cloud.top }}
                />
            ))}
        </div>
    );
};

export default LoginBackground;