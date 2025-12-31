import { useDispatch } from 'react-redux';
import { showLoader, hideLoader, setLoading } from '@/store/loaderSlice';
import { useEffect } from 'react';

export default function useLoader(initialLoading = false) {
    const dispatch = useDispatch();

    useEffect(() => {
        if (initialLoading) {
            dispatch(showLoader());
            const timer = setTimeout(() => {
                dispatch(hideLoader());
            }, 800); // Default simulated loading time
            return () => clearTimeout(timer);
        }
    }, [initialLoading, dispatch]);

    const startLoading = () => dispatch(showLoader());
    const stopLoading = () => dispatch(hideLoader());
    const setLoader = (state) => dispatch(setLoading(state));

    return { startLoading, stopLoading, setLoader };
}
