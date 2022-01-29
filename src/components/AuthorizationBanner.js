import React from "react";
import Loader from "./Loader";

// Prompts users to sign up or log in
export default props => {
    if(props.authorized) return null;
    if(props.processing) return <Loader />;
    return (
      <div className="content">
        <div id="authorization">
          <h2>Sign up or log in to upload and track your exercises!</h2>
          <div>
            <a className="action-button" onClick={() => props.showAuthorization("signUp", "showSignUpPopup")}>Sign up</a>
            <a className="action-button" onClick={() => props.showAuthorization("logIn", "showLogInPopup")}>Log in</a>
          </div>
        </div>
      </div>
    );
}