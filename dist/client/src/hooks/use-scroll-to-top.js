import { useEffect } from 'react';
import { useLocation } from 'wouter';
export function useScrollToTop() {
    var location = useLocation()[0];
    useEffect(function () {
        window.scrollTo(0, 0);
    }, [location]);
}
