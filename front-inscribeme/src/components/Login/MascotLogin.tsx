import owlImage from "../../assets/img/owl.png";

type MascotProps = {
  isPasswordFocused: boolean;
};

const MascotLogin = ({ isPasswordFocused }: MascotProps) => {
  return (
    <div
      className={`absolute left-1/2 top-25 z-30 h-[108px] w-[211px] -translate-x-1/2 bg-contain bg-center bg-no-repeat ${
        isPasswordFocused ? "owl-password" : ""
      }`}
      style={{
        backgroundImage: `url(${owlImage})`,
      }}
    >
      <div className="owl-hand owl-hand-left" />
      <div className="owl-hand owl-hand-right" />

      <div className="absolute top-14.5 h-10 w-full overflow-hidden">
        <div className="owl-arm owl-arm-left" />
        <div className="owl-arm owl-arm-right" />
      </div>
    </div>
  );
};

export default MascotLogin;