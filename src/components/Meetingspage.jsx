import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import uitoolkit from '@zoom/videosdk-ui-toolkit'
// import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";

const Meetingspage = () => {
   // let uitoolkitContainer = null;

   // const navigate = useNavigate();
   // const location = useLocation();
    
   // const sessionClosed = () => {
   //    console.log("session teardown");
   //    uitoolkitContainer && uitoolkit.closeSession(uitoolkitContainer);
   //    navigate("/startpage");
   // };

   // const joinMeeting = async (uitoolkitConfig) => {
   //    console.log( { uitoolkitConfig } );
   //    let uitoolkitContainer = document.getElementById('uitoolkitContainer');

   //    uitoolkit.joinSession(uitoolkitContainer, uitoolkitConfig);

   //    uitoolkitContainer && uitoolkit.onSessionJoined( () => { console.log({uitoolkit}) });
   //    uitoolkitContainer && uitoolkit.onSessionClosed(sessionClosed);
   // };

   // useEffect(() => {
   //  if (location.state) {
   //     joinMeeting(location.state);
   //  } else {
   //      console.error("No config object passed. Going back to /startpage")
   //      navigate("/startpage");
   //  }
   //   }, []);
   
   //   return (
   //     <React.Fragment>
   //       <main>
   //         <div id='uitoolkitContainer'></div>
   //       </main>
   //     </React.Fragment>
   //   );
};

export default Meetingspage;
