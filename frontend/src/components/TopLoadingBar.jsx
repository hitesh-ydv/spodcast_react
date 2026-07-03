import LoadingBar from "react-top-loading-bar";
import { useLoading } from "../context/LoadingContext";

export default function TopLoadingBar() {

    const { loadingRef } = useLoading();

    return (
        <LoadingBar
            color="#8E60FF"
            ref={loadingRef}
            shadow={false}
            height={3}
        />
    );

}