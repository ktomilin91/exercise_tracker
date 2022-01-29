import React from "react";
import Loader from "./Loader";

// Sign Up form
export default props => {
    if(!props.signUp.showSignUpPopup) return null;
    return (
      <div id="popup">
        <div className="content-container">
          <div className="content">
            <h2>Sign up</h2>
            <form>
              <div>
                <label for="username">Create a username:</label>
                <input type="text" name="username" required
        minlength="3" maxlength="30" value={props.signUp.username} onChange={event => props.handleInput("signUp", "username", event)}/>
              </div>
              <div>
                <label for="password">Enter a password:</label>
                <input type="password" name="password" required
        minlength="3" maxlength="30" value={props.signUp.password} onChange={event => props.handleInput("signUp", "password", event)} />
              </div>
              <div>
                <label for="repeatPassword">Repeat the password:</label>
                <input type="password" name="repeatPassword" required
        minlength="3" maxlength="30" value={props.signUp.repeatPassword} onChange={event => props.handleInput("signUp", "repeatPassword", event)} />
              </div>
              <div>
                <input type="checkbox" id="private" name="private" onChange={event => props.handleInput("signUp", "private", event, true)} />
                <label for="private" style={{
                  display: "inline-block"
                }}>Private account</label>
              </div>
              <div>
                {
                  props.signUp.signUpError ? <p className="error">{props.signUp.signUpError}</p> : ""
                }
              </div>
              {props.signUp.processing ? <Loader /> : ""}
              <div className={props.signUp.processing ? "hidden" : "shown"}>
                <input className="action-button" type="submit" value="Sign up" onClick={event => {
                  event.preventDefault();
                  if(props.signUp.processing) return;
                  props.handleSignUpLogIn("signUp");
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