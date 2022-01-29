import React from "react";

// Greeting message for authorized users containing log out button
export default props => {
    if(!props.username) return null;
    return (
        <div id="greeting">
        <h2>Hello, {props.username}!</h2>
        <a className="link" onClick={props.logOut}>Log out</a>
        </div>
    );
}