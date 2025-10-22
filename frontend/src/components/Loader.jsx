import { useState, CSSProperties } from "react";
import { PulseLoader } from "react-spinners";

function Loader() {
  let [loading, setLoading] = useState(true);

  return (
    <div className="sweet-loading flex w-full h-full items-center justify-center">

      <PulseLoader	
        color="#adadad"
        loading={loading}
        size={12}
        aria-label="Loading Spinner"
        data-testid="loader"
        margin={5}
      />
    </div>
  );
}

export default Loader;