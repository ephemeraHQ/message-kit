import "./polyfills";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import InboxPage from "./Page";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <InboxPage isPWA={true} isFullScreen={true} isConsent={true} />
  </Router>,
);
