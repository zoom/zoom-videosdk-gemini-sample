import React, { createContext, useContext, useState, useEffect } from "react";

const CurrentUserContext = createContext()

export default function CurrentUserContextProvider({children}) {
    const [currentUser, setCurrentUser] = useState({});

    return (
        <CurrentUserContext.Provider
          value={{
            currentUser,
            setCurrentUser,
          }}
        >
            {children}
        </CurrentUserContext.Provider>
    );
}

export const CurrentUser = () => {
    return useContext(CurrentUserContext);
};