import React from "react";
import Loader from "./Loader";

// Log In form
export default props => {
    if(!props.logIn.showLogInPopup) return null;
    return (
      <div id="popup">
        <div className="content-container">
          <div className="content">
            <h2>Log in</h2>
            <form>
              <div>
                <label for="username">Username:</label>
                <input type="text" name="username" required
        minlength="3" maxlength="30" value={props.logIn.username} onChange={event => props.handleInput("logIn", "username", event)} />
              </div>
              <div>
                <label for="password">Password:</label>
                <input type="password" name="password" required
        minlength="3" maxlength="30" value={props.logIn.password} onChange={event => props.handleInput("logIn", "password", event)} />
              </div>
              <div>
                {
                  props.logIn.logInError ? <p className="error">{props.logIn.logInError}</p> : ""
                }
              </div>
              {props.logIn.processing ? <Loader /> : ""}
              <div className={props.logIn.processing ? "hidden" : "shown"}>
                <input className="action-button" type="submit" value="Log in" onClick={event => {
                  event.preventDefault();
                  if(props.logIn.processing) return;
                  props.handleSignUpLogIn("logIn");
                }} />
              </div>
            </form>
            <p>
              <a class="link close-popup">Cancel</a>
            </p>
          </div>
        </div>
      </div>
    );
}