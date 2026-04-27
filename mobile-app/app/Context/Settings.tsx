import { createContext, ReactNode, useContext, useState } from "react";

type SettingsContext = {
    isSwipeInverted: boolean;
    toggleSwipeInvert: () => void;
};

const SettingsContext = createContext<SettingsContext>({ 
    isSwipeInverted: false, toggleSwipeInvert: () => {} 
});

export default SettingsContext;

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [isSwipeInverted, setIsSwipeInverted] = useState(false);

    return (
        <SettingsContext.Provider
            value={{
                isSwipeInverted,
                toggleSwipeInvert: () => setIsSwipeInverted((isSwipeInverted) => !isSwipeInverted),
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);