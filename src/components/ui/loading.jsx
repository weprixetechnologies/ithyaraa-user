export default function Loading() {
  return (
    <div className="flex items-center justify-center md:h-[calc(100dvh-200px)] h-[calc(100dvh-70px)] bg-white">

      <div className="loader-wrapper">
        <div className="loader">
          <div className="roller"></div>
          <div className="roller"></div>
        </div>

        <div id="loader2" className="loader">
          <div className="roller"></div>
          <div className="roller"></div>
        </div>

        <div id="loader3" className="loader">
          <div className="roller"></div>
          <div className="roller"></div>
        </div>
      </div>

      <style jsx>{`
        .loader-wrapper {
          width: 148px;
          height: 100px;
          position: relative;
        }
        .loader {
          width: 148px;
          height: 100px;
          top: 0;
          left: 0;
          position: absolute;
        }
        .loader::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          height: 0.25em;
          width: 1em;
          border-radius: 50%;
          background-color: #1d6390;
          opacity: 0.3;
          animation: shadow 1.2s infinite linear;
        }
        .roller,
        .roller:last-child {
          width: 70px;
          height: 70px;
          position: absolute;
          top: 0;
          left: 0;
          transform: rotate(135deg);
          animation: rollercoaster 1.2s infinite linear;
        }
        .roller:last-child {
          left: auto;
          right: 0;
          transform: rotate(-45deg);
          animation: rollercoaster2 1.2s infinite linear;
        }
        .roller::before,
        .roller:last-child::before {
          content: "";
          display: block;
          width: 15px;
          height: 15px;
          background: #40837e;
          border-radius: 50%;
        }
      
        .roller:last-child::before{
        background: #d97a3c}
        @keyframes rollercoaster {
          0% { transform: rotate(135deg); }
          8% { transform: rotate(240deg); }
          20% { transform: rotate(300deg); }
          40% { transform: rotate(380deg); }
          45% { transform: rotate(440deg); }
          50% { transform: rotate(495deg); opacity: 1; }
          50.1% { transform: rotate(495deg); opacity: 0; }
          100% { transform: rotate(495deg); opacity: 0; }
        }
        @keyframes rollercoaster2 {
          0% { opacity: 0; }
          49.9% { opacity: 0; }
          50% { opacity: 1; transform: rotate(-45deg); }
          58% { transform: rotate(-160deg); }
          70% { transform: rotate(-240deg); }
          80% { transform: rotate(-300deg); }
          90% { transform: rotate(-340deg); }
          100% { transform: rotate(-405deg); }
        }
        @keyframes shadow {
          0% { opacity: 0.3; transform: translateX(65px) scale(0.5, 0.5); }
          8% { transform: translateX(30px) scale(2, 2); }
          13% { transform: translateX(0px) scale(1.3, 1.3); }
          30% { transform: translateX(-15px) scale(0.5, 0.5); opacity: 0.1; }
          50% { transform: translateX(60px) scale(1.2, 1.2); opacity: 0.3; }
          60% { transform: translateX(130px) scale(2, 2); opacity: 0.05; }
          65% { transform: translateX(145px) scale(1.2, 1.2); }
          80% { transform: translateX(120px) scale(0.5, 0.5); opacity: 0.1; }
          90% { transform: translateX(80px) scale(0.8, 0.8); }
          100% { transform: translateX(60px); opacity: 0.3; }
        }

        #loader2::after,
        #loader2 .roller {
          animation-delay: 0.15s;
        }
        #loader3::after,
        #loader3 .roller {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
}
